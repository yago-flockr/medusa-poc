import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { MatchedShopifyProduct } from "./match-existing-shopify-products"

export type PruneStaleProductOptionValuesStepInput = {
  updates: MatchedShopifyProduct[]
}

type OptionValueLinkCompensation = {
  product_id: string
  product_option_id: string
  removedValueIds: string[]
}

export const pruneStaleProductOptionValuesStep = createStep(
  "prune-stale-product-option-values",
  async (input: PruneStaleProductOptionValuesStepInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const compensation: OptionValueLinkCompensation[] = []

    for (const { shopifyProduct, medusaProductId } of input.updates) {
      if (!shopifyProduct.options.length) {
        continue
      }

      const product = await productModuleService.retrieveProduct(medusaProductId, {
        relations: ["options", "options.values"],
      })

      const linkUpdates = shopifyProduct.options
        .map((option) => {
          const existing = product.options?.find((o) => o.title === option.name)
          if (!existing) {
            return null
          }

          const staleValueIds = (existing.values ?? [])
            .filter((value) => !option.values.includes(value.value))
            .map((value) => value.id)

          if (!staleValueIds.length) {
            return null
          }

          return {
            product_id: medusaProductId,
            product_option_id: existing.id,
            remove: staleValueIds,
          }
        })
        .filter((update): update is NonNullable<typeof update> => update !== null)

      if (!linkUpdates.length) {
        continue
      }

      await productModuleService.updateProductOptionValuesOnProduct(linkUpdates)

      for (const update of linkUpdates) {
        compensation.push({
          product_id: update.product_id,
          product_option_id: update.product_option_id,
          removedValueIds: update.remove,
        })
      }
    }

    return new StepResponse(undefined, compensation)
  },
  async (
    compensation: OptionValueLinkCompensation[] | undefined,
    { container },
  ) => {
    if (!compensation?.length) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    await productModuleService.updateProductOptionValuesOnProduct(
      compensation.map((entry) => ({
        product_id: entry.product_id,
        product_option_id: entry.product_option_id,
        add: entry.removedValueIds,
      })),
    )
  },
)
