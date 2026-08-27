import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { ShopifyProduct } from "../../../integrations/shopify/products"
import { findExistingShopifyProductIds } from "../../../integrations/shopify/helpers/resolve-existing-products"

export type MatchExistingShopifyProductsStepInput = {
  products: ShopifyProduct[]
}

export type MatchedShopifyProduct = {
  shopifyProduct: ShopifyProduct
  medusaProductId: string
}

/**
 * Splits the vendor's checked selection into products to create vs. products
 * to update, matched by Shopify's own product id (Medusa's `external_id`).
 * Read-only, nothing to compensate.
 */
export const matchExistingShopifyProductsStep = createStep(
  "match-existing-shopify-products",
  async (input: MatchExistingShopifyProductsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const existingIds = await findExistingShopifyProductIds(
      query,
      input.products.map((product) => product.shopify_id),
    )

    const created: ShopifyProduct[] = []
    const updated: MatchedShopifyProduct[] = []

    for (const product of input.products) {
      const medusaProductId = existingIds.get(product.shopify_id)
      if (medusaProductId) {
        updated.push({ shopifyProduct: product, medusaProductId })
      } else {
        created.push(product)
      }
    }

    return new StepResponse({ created, updated })
  },
)
