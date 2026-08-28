import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MatchedShopifyProduct } from "./match-existing-shopify-products"

export type SyncProductOptionValuesStepInput = {
  updates: MatchedShopifyProduct[]
}

type OptionValueCompensation = {
  id: string
  previousValues: string[]
}

/**
 * updateProductsWorkflow validates a variant's option values against an
 * option's already-persisted values before applying an update — it doesn't
 * register brand-new values introduced by that same update first. A re-sync
 * whose Shopify data added an option value since the last import needs that
 * value added to the existing option before the variant update runs, the
 * same way resolve-shared-product-options.ts already does for the create
 * path (productModuleService.updateProductOptions), just scoped to one
 * product's own option instead of a title-matched shared one.
 */
export const syncProductOptionValuesStep = createStep(
  "sync-product-option-values",
  async (input: SyncProductOptionValuesStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productModuleService = container.resolve(Modules.PRODUCT)

    const compensation: OptionValueCompensation[] = []

    for (const { shopifyProduct, medusaProductId } of input.updates) {
      if (!shopifyProduct.options.length) {
        continue
      }

      const { data: existingOptions } = await query.graph({
        entity: "product_option",
        fields: ["id", "title", "values.value"],
        filters: { products: { id: medusaProductId } },
      })

      for (const option of shopifyProduct.options) {
        const existing = existingOptions.find((o) => o.title === option.name)
        if (!existing) {
          continue
        }

        const existingValues = (existing.values ?? [])
          .filter((value) => value != null)
          .map((value) => value!.value)
        const missingValues = option.values.filter(
          (value) => !existingValues.includes(value),
        )

        if (!missingValues.length) {
          continue
        }

        await productModuleService.updateProductOptions(existing.id, {
          values: [...existingValues, ...missingValues],
        })

        compensation.push({ id: existing.id, previousValues: existingValues })
      }
    }

    return new StepResponse(undefined, compensation)
  },
  async (compensation: OptionValueCompensation[] | undefined, { container }) => {
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
