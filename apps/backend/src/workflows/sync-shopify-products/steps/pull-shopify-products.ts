import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  pullShopifyTestProducts,
  type ShopifyStoreCredentials,
} from "../../../lib/shopify-test-pull"

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
    const result = await pullShopifyTestProducts(input.credentials, input.first ?? 5)
    return new StepResponse(result)
  },
)
