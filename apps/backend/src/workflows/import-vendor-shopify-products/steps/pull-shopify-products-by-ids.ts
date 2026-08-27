import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import type { ShopifyStoreCredentials } from "../../../integrations/shopify/client"
import { pullShopifyProductsByIds } from "../../../integrations/shopify/products"

export type PullShopifyProductsByIdsStepInput = {
  credentials: ShopifyStoreCredentials
  shopifyProductIds: string[]
}

/**
 * Re-fetches the exact products a vendor checked, fresh from Shopify —
 * never trusts the product payload the frontend already displayed.
 * Read-only, nothing to compensate.
 */
export const pullShopifyProductsByIdsStep = createStep(
  "pull-shopify-products-by-ids",
  async (input: PullShopifyProductsByIdsStepInput) => {
    const result = await pullShopifyProductsByIds(
      input.credentials,
      input.shopifyProductIds,
    )
    return new StepResponse(result)
  },
)
