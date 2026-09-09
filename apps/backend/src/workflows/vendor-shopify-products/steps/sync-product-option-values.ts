import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { MatchedShopifyProduct } from "./match-existing-shopify-products"

export type SyncProductOptionValuesStepInput = {
  updates: MatchedShopifyProduct[]
}

type OptionValueLinkCompensation = {
  product_id: string
  product_option_id: string
  addedValueIds: string[]
}

export const syncProductOptionValuesStep = createStep(
  "sync-product-option-values",
  async (input: SyncProductOptionValuesStepInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const compensation: OptionValueLinkCompensation[] = []

    for (const { shopifyProduct, medusaProductId } of input.updates) {
      if (!shopifyProduct.options.length) {
        continue
      }

      const product = await productModuleService.retrieveProduct(
        medusaProductId,
        {
          relations: ["options", "options.values"],
        },
      )

      const linkUpdates = shopifyProduct.options
        .map((option) => {
          const existing = product.options?.find((o) => o.title === option.name)
          if (!existing) {
            return null
          }

          const existingValues = new Set(
            (existing.values ?? []).map((value) => value.value),
          )
          const missingValues = option.values.filter(
            (value) => !existingValues.has(value),
          )

          if (!missingValues.length) {
            return null
          }

          return {
            product_id: medusaProductId,
            product_option_id: existing.id,
            add: missingValues.map((value) => ({ value })),
          }
        })
        .filter(
          (update): update is NonNullable<typeof update> => update !== null,
        )

      if (!linkUpdates.length) {
        continue
      }

      await productModuleService.updateProductOptionValuesOnProduct(linkUpdates)

      const updatedProduct = await productModuleService.retrieveProduct(
        medusaProductId,
        { relations: ["options", "options.values"] },
      )

      for (const update of linkUpdates) {
        const option = updatedProduct.options?.find(
          (o) => o.id === update.product_option_id,
        )
        const addedValueIds = (option?.values ?? [])
          .filter((value) =>
            update.add.some((added) => added.value === value.value),
          )
          .map((value) => value.id)

        compensation.push({
          product_id: update.product_id,
          product_option_id: update.product_option_id,
          addedValueIds,
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
        remove: entry.addedValueIds,
      })),
    )
  },
)
