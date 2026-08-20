import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type ResolveSharedProductOptionsStepInput = {
  options: { title: string; values: string[] }[]
  // Only vendor-provided options (Size, Color, ...) should become shared,
  // storefront-filterable options. The single "Default" option synthesized
  // for a no-options product must stay exclusive to that product, so this
  // step is a no-op pass-through when false — see create-vendor-product/
  // index.ts for which case sets it.
  shared: boolean
}

type ResolvedOption = { id: string } | { title: string; values: string[] }

type OptionCompensation = {
  id: string
  previousValues: string[]
}

// Medusa's shared (is_exclusive: false) product options are looked up by
// title with a real DB-level unique constraint — creating one with a title
// that already exists throws outright, and there is no per-product/
// per-vendor scoping possible for it (confirmed by testing). So making
// vendor options filterable means resolving each one to the *same*
// underlying option row every vendor's products with that title share,
// adding any new values to it, rather than creating a fresh row per
// product. This is the correct marketplace behaviour, not a workaround: a
// customer filtering the whole store by "Color" should see every vendor's
// matching products, not just one's.
export const resolveSharedProductOptionsStep = createStep(
  "resolve-shared-product-options",
  async (input: ResolveSharedProductOptionsStepInput, { container }) => {
    if (!input.shared) {
      return new StepResponse(
        input.options.map((option) => ({
          title: option.title,
          values: option.values,
        })) satisfies ResolvedOption[],
        [],
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productModuleService = container.resolve(Modules.PRODUCT)

    const resolved: ResolvedOption[] = []
    const compensation: OptionCompensation[] = []

    for (const option of input.options) {
      const {
        data: [existing],
      } = await query.graph({
        entity: "product_option",
        fields: ["id", "values.value"],
        filters: { title: option.title, is_exclusive: false },
      })

      if (!existing) {
        resolved.push({ title: option.title, values: option.values })
        continue
      }

      const existingValues = (existing.values ?? [])
        .filter((value) => value != null)
        .map((value) => value!.value)
      const missingValues = option.values.filter(
        (value) => !existingValues.includes(value),
      )

      if (missingValues.length) {
        await productModuleService.updateProductOptions(existing.id, {
          values: [...existingValues, ...missingValues],
        })
        compensation.push({ id: existing.id, previousValues: existingValues })
      }

      resolved.push({ id: existing.id })
    }

    return new StepResponse(resolved, compensation)
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
