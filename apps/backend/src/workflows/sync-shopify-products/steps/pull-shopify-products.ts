import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import type { ShopifyStoreCredentials } from "../../../integrations/shopify/client"
import { pullShopifyProducts } from "../../../integrations/shopify/products"

export type PullShopifyProductsStepInput = {
  credentials: ShopifyStoreCredentials
  first?: number
}

/**
 * Read-only, nothing to compensate. docs/spikes/vendor-shopify-sync.md
 */
export const pullShopifyProductsStep = createStep(
  "pull-shopify-products",
  async (input: PullShopifyProductsStepInput) => {
    const result = await pullShopifyProducts(input.credentials, input.first ?? 5)
    return new StepResponse(result)
  },
)
