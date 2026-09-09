import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { findExistingShopifyProductIds } from "../../../integrations/shopify/helpers/resolve-existing-products"

export type FindExistingShopifyProductsStepInput = {
  shopifyIds: string[]
}

export const findExistingShopifyProductsStep = createStep(
  "find-existing-shopify-products",
  async (
    { shopifyIds }: FindExistingShopifyProductsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const existingIds = await findExistingShopifyProductIds(query, shopifyIds)

    return new StepResponse(Object.fromEntries(existingIds))
  },
)
