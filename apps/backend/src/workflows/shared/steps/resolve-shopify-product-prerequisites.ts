import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { resolveStorePrerequisites } from "../../../lib/resolve-store-prerequisites"
import { resolveVendorShippingProfileId } from "../../../lib/resolve-vendor-shipping-profile"
import type { ProductPrerequisites } from "../../../lib/build-medusa-product-input"

export type ResolveShopifyProductPrerequisitesStepInput = {
  shopCurrencyCode: string
  vendorId: string
}

export const resolveShopifyProductPrerequisitesStep = createStep(
  "resolve-shopify-product-prerequisites",
  async (
    input: ResolveShopifyProductPrerequisitesStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { salesChannelId, storeCurrencies } = await resolveStorePrerequisites(query)
    const shippingProfileId = await resolveVendorShippingProfileId(query, input.vendorId)

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
    } satisfies ProductPrerequisites)
  },
)
