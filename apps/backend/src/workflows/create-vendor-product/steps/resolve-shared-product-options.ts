import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type ResolveSharedProductOptionsStepInput = {
  options: { title: string; values: string[] }[]
  shared: boolean
}

type ResolvedOption =
  | { id: string }
  | { title: string; values: string[]; is_exclusive?: boolean }

type OptionCompensation = {
  id: string
  previousValues: string[]
}

// `shared` is true only for vendor-provided options (Size, Color, ...);
// it's false for the synthetic "Default" option on a no-options product,
// which must stay exclusive to that one product — this step is a no-op
// pass-through in that case.
//
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
      const resolved: ResolvedOption[] = input.options.map((option) => ({
        title: option.title,
        values: option.values,
      }))
      return new StepResponse(resolved, [])
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productModuleService = container.resolve(Modules.PRODUCT)

    const { data: existingOptions } = await query.graph({
      entity: "product_option",
      fields: ["id", "title", "values.value"],
      filters: {
        title: input.options.map((option) => option.title),
        is_exclusive: false,
      },
    })

    const existingByTitle = new Map(
      existingOptions.map((option) => [option.title, option]),
    )

    const updates = input.options.flatMap((option) => {
      const existing = existingByTitle.get(option.title)
      if (!existing) {
        return []
      }

      const existingValues = (existing.values ?? [])
        .filter((value) => value != null)
        .map((value) => value!.value)
      const missingValues = option.values.filter(
        (value) => !existingValues.includes(value),
      )

      return missingValues.length
        ? [{ id: existing.id, existingValues, missingValues }]
        : []
    })

    await Promise.all(
      updates.map((update) =>
        productModuleService.updateProductOptions(update.id, {
          values: [...update.existingValues, ...update.missingValues],
        }),
      ),
    )

    const compensation: OptionCompensation[] = updates.map((update) => ({
      id: update.id,
      previousValues: update.existingValues,
    }))

    const resolved: ResolvedOption[] = input.options.map((option) => {
      const existing = existingByTitle.get(option.title)
      return existing
        ? { id: existing.id }
        : { title: option.title, values: option.values, is_exclusive: false }
    })

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
