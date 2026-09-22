import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type {
  CreateProductWorkflowInputDTO,
  MedusaContainer,
} from "@medusajs/framework/types"

import { graph } from "../../../lib/query"
export type ResolveSharedProductOptionsStepInput = {
  options: { title: string; values: string[] }[]
  shared: boolean
}

export type ResolvedProductOption = NonNullable<
  CreateProductWorkflowInputDTO["options"]
>[number]

type ResolvedOption = ResolvedProductOption

export type CanonicalTitleByNormalized = Record<string, string>
export type CanonicalValuesByTitle = Record<string, Record<string, string>>

type OptionUpdateCompensation = {
  kind: "updated"
  id: string
  previousTitle: string
  previousValues: string[]
}

type OptionCreateCompensation = {
  kind: "created"
  id: string
}

type OptionCompensation = OptionUpdateCompensation | OptionCreateCompensation

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// Same as normalize() today — kept separate since the two express different
// intents at each call site (match vs. canonical stored form).
export function canonicalize(value: string): string {
  return normalize(value)
}

// Medusa matches a variant's option map to its option rows by exact,
// case-sensitive title — this rewrites values to the canonical casing.
export function remapOptionTitles(
  options: Record<string, string>,
  canonicalTitleByNormalized: CanonicalTitleByNormalized,
  canonicalValuesByTitle: CanonicalValuesByTitle = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(options).map(([title, value]) => {
      const canonicalTitle =
        canonicalTitleByNormalized[normalize(title)] ?? canonicalize(title)
      const canonicalValue =
        canonicalValuesByTitle[canonicalTitle]?.[normalize(value)] ??
        canonicalize(value)
      return [canonicalTitle, canonicalValue]
    }),
  )
}

function resolveExclusiveOptions(
  options: { title: string; values: string[] }[],
): ResolvedOption[] {
  return options.map((option) => ({
    title: canonicalize(option.title),
    values: option.values.map(canonicalize),
  }))
}

function canonicalTitlesFor(
  options: { title: string; values: string[] }[],
): CanonicalTitleByNormalized {
  return Object.fromEntries(
    options.map((option) => [
      normalize(option.title),
      canonicalize(option.title),
    ]),
  )
}

function canonicalValuesFor(
  options: { title: string; values: string[] }[],
): CanonicalValuesByTitle {
  return Object.fromEntries(
    options.map((option) => [
      canonicalize(option.title),
      Object.fromEntries(
        option.values.map((value) => [normalize(value), canonicalize(value)]),
      ),
    ]),
  )
}

// Shared options are unique by title (case-insensitive) under a DB
// constraint — every occurrence across this batch resolves to one row,
// created/updated exactly once even if a new title appears twice.
async function resolveSharedOptionsWithLocking(
  options: { title: string; values: string[] }[],
  container: MedusaContainer,
): Promise<{
  resolved: ResolvedOption[]
  compensation: OptionCompensation[]
  canonicalTitleByNormalized: CanonicalTitleByNormalized
  canonicalValuesByTitle: CanonicalValuesByTitle
}> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const lockingModuleService = container.resolve(Modules.LOCKING)

  const { data: existingOptions } = await graph(query, {
    entity: "product_option",
    fields: ["id", "title"],
    filters: { is_exclusive: false },
  })

  const resolvedByNormalizedTitle = new Map(
    existingOptions.map((option) => [
      normalize(option.title),
      { id: option.id },
    ]),
  )

  const canonicalValuesByTitle: CanonicalValuesByTitle = {}
  const compensation: OptionCompensation[] = []

  const occurrencesByNormalizedTitle = new Map<
    string,
    { title: string; values: string[] }[]
  >()
  for (const option of options) {
    const key = normalize(option.title)
    const list = occurrencesByNormalizedTitle.get(key) ?? []
    list.push(option)
    occurrencesByNormalizedTitle.set(key, list)
  }

  await Promise.all(
    Array.from(occurrencesByNormalizedTitle.entries()).map(
      async ([normalizedTitle, occurrences]) => {
        const canonicalTitle = canonicalize(occurrences[0].title)
        const incomingValues = Array.from(
          new Set(
            occurrences.flatMap((option) => option.values).map(canonicalize),
          ),
        )

        // Locked per title with a fresh read inside — a concurrent import
        // could otherwise race the same title between snapshot and write.
        await lockingModuleService.execute(
          `product-option:title:${normalizedTitle}`,
          async () => {
            // Matched case-insensitively in JS and re-read fresh inside the
            // lock, so a pre-existing non-canonical row and a concurrent
            // creator's just-committed row are both still seen.
            const { data: freshExisting } = await graph(query, {
              entity: "product_option",
              fields: ["id", "title", "values.value"],
              filters: { is_exclusive: false },
            })
            const fresh = freshExisting.find(
              (option) => normalize(option.title) === normalizedTitle,
            )

            if (!fresh) {
              const [created] = await productModuleService.createProductOptions(
                [
                  {
                    title: canonicalTitle,
                    values: incomingValues,
                    is_exclusive: false,
                  },
                ],
              )

              resolvedByNormalizedTitle.set(normalizedTitle, { id: created.id })
              canonicalValuesByTitle[canonicalTitle] = Object.fromEntries(
                incomingValues.map((v) => [normalize(v), v]),
              )
              compensation.push({ kind: "created", id: created.id })
              return
            }

            const existingValues = (fresh.values ?? [])
              .filter((value) => value != null)
              .map((value) => value!.value)

            // Existing values are never renamed/removed in place — Medusa
            // refuses that once a value is linked to a variant. Only
            // genuinely new values get appended, in canonical casing.
            const existingValuesNormalized = new Set(
              existingValues.map(normalize),
            )
            const missingValues = incomingValues.filter(
              (value) => !existingValuesNormalized.has(normalize(value)),
            )
            const finalValues = [...existingValues, ...missingValues]

            canonicalValuesByTitle[canonicalTitle] = Object.fromEntries(
              finalValues.map((v) => [normalize(v), v]),
            )

            resolvedByNormalizedTitle.set(normalizedTitle, { id: fresh.id })

            const titleChanged = fresh.title !== canonicalTitle
            if (!missingValues.length && !titleChanged) {
              return
            }

            await productModuleService.updateProductOptions(fresh.id, {
              title: canonicalTitle,
              values: finalValues,
            })

            compensation.push({
              kind: "updated",
              id: fresh.id,
              previousTitle: fresh.title,
              previousValues: existingValues,
            })
          },
        )
      },
    ),
  )

  const resolved: ResolvedOption[] = options.map((option) => ({
    id: resolvedByNormalizedTitle.get(normalize(option.title))!.id,
  }))

  return {
    resolved,
    compensation,
    canonicalTitleByNormalized: canonicalTitlesFor(options),
    canonicalValuesByTitle,
  }
}

// Re-groups the flat resolved list back into each product's original chunk sizes.
export function chunkResolvedOptions(
  perProductRawOptions: { title: string; values: string[] }[][],
  resolvedFlat: ResolvedProductOption[],
): ResolvedProductOption[][] {
  const chunks: ResolvedProductOption[][] = []
  let cursor = 0

  for (const rawOptions of perProductRawOptions) {
    chunks.push(resolvedFlat.slice(cursor, cursor + rawOptions.length))
    cursor += rawOptions.length
  }

  return chunks
}

export type ResolvedProductOptionsResult = {
  options: ResolvedOption[]
  canonicalTitleByNormalized: CanonicalTitleByNormalized
  canonicalValuesByTitle: CanonicalValuesByTitle
}

export const resolveSharedProductOptionsStep = createStep(
  "resolve-shared-product-options",
  async (input: ResolveSharedProductOptionsStepInput, { container }) => {
    if (!input.shared) {
      return new StepResponse(
        {
          options: resolveExclusiveOptions(input.options),
          canonicalTitleByNormalized: canonicalTitlesFor(input.options),
          canonicalValuesByTitle: canonicalValuesFor(input.options),
        },
        [],
      )
    }

    const {
      resolved,
      compensation,
      canonicalTitleByNormalized,
      canonicalValuesByTitle,
    } = await resolveSharedOptionsWithLocking(input.options, container)
    return new StepResponse(
      { options: resolved, canonicalTitleByNormalized, canonicalValuesByTitle },
      compensation,
    )
  },
  async (compensation: OptionCompensation[] | undefined, { container }) => {
    if (!compensation?.length) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    const createdIds = compensation
      .filter(
        (entry): entry is OptionCreateCompensation => entry.kind === "created",
      )
      .map((entry) => entry.id)
    const updatedEntries = compensation.filter(
      (entry): entry is OptionUpdateCompensation => entry.kind === "updated",
    )

    await Promise.all([
      createdIds.length
        ? productModuleService.deleteProductOptions(createdIds)
        : null,
      ...updatedEntries.map((entry) =>
        productModuleService.updateProductOptions(entry.id, {
          title: entry.previousTitle,
          values: entry.previousValues,
        }),
      ),
    ])
  },
)
