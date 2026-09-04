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

type OptionCompensation = {
  id: string
  previousTitle: string
  previousValues: string[]
}

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// The single source of truth for option/value casing: no matter who typed
// "size", "Size", "SIZE" or "SiZe", it always becomes "Size" — same for
// values ("s" / "S" / "SMALL" / "Small" all become "Small"/"S"). This
// replaces ever asking "what casing does the existing option already use" —
// there's only ever one canonical answer, so two vendors (or a vendor and a
// Shopify import) can never disagree on it.
export function canonicalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase())
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
// underlying row — and that row's title/values are forced to canonical
// casing every time they're touched, correcting any stale casing left over
// from before this normalization existed.
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
        const canonicalTitle = canonicalize(option.title)
        const existing = existingByNormalizedTitle.get(normalize(option.title))

        if (!existing) {
          canonicalValuesByTitle[canonicalTitle] = Object.fromEntries(
            option.values.map((value) => [normalize(value), canonicalize(value)]),
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

            // Existing values are matched case-insensitively but never
            // renamed/removed in place — Medusa refuses to drop a value
            // that's already linked to a real variant, and correctly so
            // (renaming "s" to "S" here would look like deleting "s" and
            // adding "S"). Only genuinely new values get added, and they're
            // added in canonical casing so the option converges over time
            // as new values get introduced.
            const existingValuesNormalized = new Set(existingValues.map(normalize))
            const missingValues = option.values
              .map(canonicalize)
              .filter((value) => !existingValuesNormalized.has(normalize(value)))
            const finalValues = [...existingValues, ...missingValues]

            canonicalValuesByTitle[canonicalTitle] = Object.fromEntries(
              finalValues.map((v) => [normalize(v), v]),
            )

            const titleChanged = existing.title !== canonicalTitle

            if (!missingValues.length && !titleChanged) {
              return null
            }

            await productModuleService.updateProductOptions(existing.id, {
              title: canonicalTitle,
              values: finalValues,
            })

            return {
              id: existing.id,
              previousTitle: existing.title,
              previousValues: existingValues,
            }
          }),
        ]
      }),
    )
  ).filter((update): update is OptionCompensation => update !== null)

  const resolved: ResolvedOption[] = options.map((option) => {
    const existing = existingByNormalizedTitle.get(normalize(option.title))
    return existing
      ? { id: existing.id }
      : {
          title: canonicalize(option.title),
          values: option.values.map(canonicalize),
          is_exclusive: false,
        }
  })

  return {
    resolved,
    compensation: updates,
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

    await Promise.all(
      compensation.map((entry) =>
        productModuleService.updateProductOptions(entry.id, {
          title: entry.previousTitle,
          values: entry.previousValues,
        }),
      ),
    )
  },
)
