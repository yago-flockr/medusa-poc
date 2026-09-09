import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { pullShopifyProducts } from "../../../integrations/shopify/products"
import type { ShopifyStoreCredentials } from "../../../integrations/shopify/client"

export type PullShopifyProductsStepInput = {
  credentials: ShopifyStoreCredentials
}

export const pullShopifyProductsStep = createStep(
  "pull-shopify-products",
  async ({ credentials }: PullShopifyProductsStepInput) => {
    const pulled = await pullShopifyProducts(credentials)

    return new StepResponse(pulled)
  },
)
