import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { resolveStorePrerequisites } from "../../../lib/resolve-store-prerequisites"
import type { ShopifyProductPrerequisites } from "../../../integrations/shopify/mappers/product-input.mapper"

export type ResolveShopifyProductPrerequisitesStepInput = {
  shopCurrencyCode: string
}

export const resolveShopifyProductPrerequisitesStep = createStep(
  "resolve-shopify-product-prerequisites",
  async (
    input: ResolveShopifyProductPrerequisitesStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { shippingProfileId, salesChannelId, storeCurrencies } =
      await resolveStorePrerequisites(query)

    const currencyCode = input.shopCurrencyCode.toLowerCase()

    if (!storeCurrencies.includes(currencyCode)) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shopify's shop currency (${currencyCode}) is not one of the store's supported currencies (${storeCurrencies.join(", ")}).`,
      )
    }

    return new StepResponse({
      shippingProfileId,
      salesChannelId,
      currencyCode,
    } satisfies ShopifyProductPrerequisites)
  },
)
