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

// Normalized option title -> the title actually attached to the product
// (the DB's existing casing for a matched shared option, or the vendor's
// own casing when the option is newly created). Every variant's `options`
// map must be rewritten through this before it reaches Medusa core — see
// remapOptionTitles.
export type CanonicalTitleByNormalized = Record<string, string>

// Canonical title -> (normalized value -> the value's actual stored
// casing). Same problem as the title map, one level down: a shared
// option's values also have a case-insensitive uniqueness rule, so a
// vendor typing "s" against an already-established "S" must have their
// variant rewritten to "S", or Medusa's exact-match variant/value lookup
// fails the same way.
export type CanonicalValuesByTitle = Record<string, Record<string, string>>

type OptionCompensation = {
  id: string
  previousValues: string[]
}

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// Medusa core links a variant to its option by an exact, case-sensitive
// title match against the option rows actually attached to the product.
// When a shared option gets resolved to an existing row (see
// resolveSharedOptionsWithLocking), that row's title can carry different
// casing than whatever the vendor originally typed — e.g. a vendor types
// "size" but the shared option was first created as "Size" by an earlier
// vendor or a Shopify import. Left alone, the variant would still carry the
// vendor's original casing and Medusa's exact-match lookup would fail with
// "Option value <v> does not exist for option <title>". This rewrites a
// variant's option-title keys to whatever title actually ended up on the
// product, falling back to the original title when there's no entry (a
// freshly created option, or the exclusive/no-options path).
export function remapOptionTitles(
  options: Record<string, string>,
  canonicalTitleByNormalized: CanonicalTitleByNormalized,
  canonicalValuesByTitle: CanonicalValuesByTitle = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(options).map(([title, value]) => {
      const canonicalTitle = canonicalTitleByNormalized[normalize(title)] ?? title
      const canonicalValue =
        canonicalValuesByTitle[canonicalTitle]?.[normalize(value)] ?? value
      return [canonicalTitle, canonicalValue]
    }),
  )
}

function resolveExclusiveOptions(
  options: { title: string; values: string[] }[],
): ResolvedOption[] {
  return options.map((option) => ({ title: option.title, values: option.values }))
}

// Medusa's shared (is_exclusive: false) product options are looked up by
// title with a DB-level unique constraint, so every product with the same
// option title (compared case-insensitively) must resolve to the same
// underlying row.
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

  const existingByNormalizedTitle = new Map(
    existingOptions.map((option) => [normalize(option.title), option]),
  )

  const canonicalValuesByTitle: CanonicalValuesByTitle = {}

  const updates = (
    await Promise.all(
      options.flatMap((option) => {
        const existing = existingByNormalizedTitle.get(normalize(option.title))
        if (!existing) {
          canonicalValuesByTitle[option.title] = Object.fromEntries(
            option.values.map((value) => [normalize(value), value]),
          )
          return []
        }

        return [
          // Locked per option id, with a fresh read inside the lock — two
          // concurrent writers adding different values would otherwise both
          // read the same stale list and one's addition would silently
          // overwrite the other's.
          lockingModuleService.execute(`product-option:${existing.id}`, async () => {
            const {
              data: [fresh],
            } = await query.graph({
              entity: "product_option",
              fields: ["values.value"],
              filters: { id: existing.id },
            })

            const existingValues = (fresh.values ?? [])
              .filter((value) => value != null)
              .map((value) => value!.value)
            const existingValuesNormalized = new Set(existingValues.map(normalize))
            const missingValues = option.values.filter(
              (value) => !existingValuesNormalized.has(normalize(value)),
            )

            const allValues = [...existingValues, ...missingValues]
            canonicalValuesByTitle[existing.title] = Object.fromEntries(
              allValues.map((value) => [normalize(value), value]),
            )

            if (!missingValues.length) {
              return null
            }

            await productModuleService.updateProductOptions(existing.id, {
              values: allValues,
            })

            return { id: existing.id, previousValues: existingValues }
          }),
        ]
      }),
    )
  ).filter((update): update is OptionCompensation => update !== null)

  const resolved: ResolvedOption[] = options.map((option) => {
    const existing = existingByNormalizedTitle.get(normalize(option.title))
    return existing
      ? { id: existing.id }
      : { title: option.title, values: option.values, is_exclusive: false }
  })

  const canonicalTitleByNormalized: CanonicalTitleByNormalized = Object.fromEntries(
    options.map((option) => {
      const existing = existingByNormalizedTitle.get(normalize(option.title))
      return [normalize(option.title), existing?.title ?? option.title]
    }),
  )

  return { resolved, compensation: updates, canonicalTitleByNormalized, canonicalValuesByTitle }
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
          canonicalTitleByNormalized: {},
          canonicalValuesByTitle: {},
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

    await Promise.all(
      compensation.map((entry) =>
        productModuleService.updateProductOptions(entry.id, {
          values: entry.previousValues,
        }),
      ),
    )
  },
)
