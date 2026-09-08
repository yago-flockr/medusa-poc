import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type {
  CreateProductWorkflowInputDTO,
  MedusaContainer,
} from "@medusajs/framework/types"

export type ResolveSharedProductOptionsStepInput = {
  options: { title: string; values: string[] }[]
  shared: boolean
}

export type ResolvedProductOption = NonNullable<
  CreateProductWorkflowInputDTO["options"]
>[number]

type ResolvedOption = ResolvedProductOption

// Normalized option title -> the one canonical title every product using
// that option (regardless of who typed what casing) is forced to use.
export type CanonicalTitleByNormalized = Record<string, string>

// Canonical title -> (normalized value -> the one canonical casing of that
// value). Same idea one level down, for option values.
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

// The single source of truth for option/value casing: no matter who typed
// "size", "Size", "SIZE" or "SiZe", it always becomes "size" — same for
// values ("s" / "S" / "SMALL" / "SmAlL" all become "s"/"small"). Always
// lowercase, no exceptions — this replaces ever asking "what casing does the
// existing option already use," so two vendors (or a vendor and a Shopify
// import) can never disagree on it. Identical to `normalize` today by
// design: the canonical stored form and the case-insensitive comparison
// form are the same rule. Kept as a separate named function anyway, since
// the two express different intents at each call site (what gets matched vs.
// what gets stored) even though they currently compute the same thing.
export function canonicalize(value: string): string {
  return normalize(value)
}

// Medusa core links a variant to its option by an exact, case-sensitive
// title match against the option rows actually attached to the product, so
// a variant's `options` map keys/values must carry the exact same
// canonical casing as the option/value rows they reference — this rewrites
// them to match, falling back to the original text when there's no
// canonical entry for it (shouldn't normally happen, but keeps this
// non-destructive if it ever does).
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
        canonicalValuesByTitle[canonicalTitle]?.[normalize(value)] ?? canonicalize(value)
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
    options.map((option) => [normalize(option.title), canonicalize(option.title)]),
  )
}

function canonicalValuesFor(
  options: { title: string; values: string[] }[],
): CanonicalValuesByTitle {
  return Object.fromEntries(
    options.map((option) => [
      canonicalize(option.title),
      Object.fromEntries(option.values.map((value) => [normalize(value), canonicalize(value)])),
    ]),
  )
}

// Medusa's shared (is_exclusive: false) product options are looked up by
// title with a DB-level unique constraint, so every product with the same
// option title (compared case-insensitively) must resolve to the same
// underlying row. Every option in `options` — whether it already exists or
// is being introduced for the first time — is resolved here to a real row
// id before this step returns; nothing downstream (createProductsWorkflow)
// is ever handed a fresh `{title, values}` object for a shared option. That
// matters because a single call to this step can carry the same brand-new
// title more than once (two products in one Shopify import batch both
// introducing "color" for the first time, say) — if creation were left to
// createProductsWorkflow instead, each occurrence would try to insert its
// own row and the second would trip the option's global unique title index.
// Grouping every occurrence of a title into one entry, resolved exactly
// once, is what prevents that regardless of how many products share it.
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

  const { data: existingOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title"],
    filters: { is_exclusive: false },
  })

  const resolvedByNormalizedTitle = new Map(
    existingOptions.map((option) => [normalize(option.title), { id: option.id }]),
  )

  const canonicalValuesByTitle: CanonicalValuesByTitle = {}
  const compensation: OptionCompensation[] = []

  const occurrencesByNormalizedTitle = new Map<string, { title: string; values: string[] }[]>()
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
          new Set(occurrences.flatMap((option) => option.values).map(canonicalize)),
        )

        // Locked per title, with a fresh read inside the lock — a
        // concurrent request (a second import running at the same time)
        // could otherwise create or update this same title between our
        // initial snapshot and this write.
        await lockingModuleService.execute(`product-option:title:${normalizedTitle}`, async () => {
          const { data: freshExisting } = await query.graph({
            entity: "product_option",
            fields: ["id", "title", "values.value"],
            filters: { title: canonicalTitle, is_exclusive: false },
          })
          const fresh = freshExisting[0]

          if (!fresh) {
            const [created] = await productModuleService.createProductOptions([
              { title: canonicalTitle, values: incomingValues, is_exclusive: false },
            ])

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

          // Existing values are matched case-insensitively but never
          // renamed/removed in place — Medusa refuses to drop a value
          // that's already linked to a real variant, and correctly so
          // (renaming "s" to "S" here would look like deleting "s" and
          // adding "S"). Only genuinely new values get added, and they're
          // added in canonical casing so the option converges over time
          // as new values get introduced.
          const existingValuesNormalized = new Set(existingValues.map(normalize))
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
        })
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

// resolveSharedProductOptionsStep resolves one flat list of raw options at a
// time — this re-groups the resolved results back into the per-product
// chunks the caller flattened them from, given each product's original raw
// option count.
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

    const { resolved, compensation, canonicalTitleByNormalized, canonicalValuesByTitle } =
      await resolveSharedOptionsWithLocking(input.options, container)
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
      .filter((entry): entry is OptionCreateCompensation => entry.kind === "created")
      .map((entry) => entry.id)
    const updatedEntries = compensation.filter(
      (entry): entry is OptionUpdateCompensation => entry.kind === "updated",
    )

    await Promise.all([
      createdIds.length ? productModuleService.deleteProductOptions(createdIds) : null,
      ...updatedEntries.map((entry) =>
        productModuleService.updateProductOptions(entry.id, {
          title: entry.previousTitle,
          values: entry.previousValues,
        }),
      ),
    ])
  },
)
