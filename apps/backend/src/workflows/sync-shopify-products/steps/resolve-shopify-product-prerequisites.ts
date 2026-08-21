import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export type ResolveShopifyProductPrerequisitesStepInput = {
  shopCurrencyCode: string
}

export type ShopifyProductPrerequisites = {
  shippingProfileId: string
  salesChannelId: string | null
  currencyCode: string
}

/**
 * Mirrors the same prerequisite resolution src/api/vendors/products/route.ts
 * already does for vendor-created products — a synced-in product needs the
 * exact same shipping-profile/sales-channel wiring or it's unfulfillable /
 * invisible with no error raised (docs/spikes/vendor-shopify-sync.md).
 * Read-only, nothing to compensate.
 */
export const resolveShopifyProductPrerequisitesStep = createStep(
  "resolve-shopify-product-prerequisites",
  async (
    input: ResolveShopifyProductPrerequisitesStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [store],
    } = await query.graph({
      entity: "store",
      fields: ["default_sales_channel_id", "supported_currencies.currency_code"],
    })

    const {
      data: [shippingProfile],
    } = await query.graph({ entity: "shipping_profile", fields: ["id"] })

    if (!shippingProfile) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "The store has no shipping profile configured — cannot create a shippable product.",
      )
    }

    const storeCurrencies = (store.supported_currencies ?? []).map(
      (currency) => currency!.currency_code,
    )
    const currencyCode = input.shopCurrencyCode.toLowerCase()

    if (!storeCurrencies.includes(currencyCode)) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shopify's shop currency (${currencyCode}) is not one of the store's supported currencies (${storeCurrencies.join(", ")}).`,
      )
    }

    return new StepResponse({
      shippingProfileId: shippingProfile.id,
      salesChannelId: store.default_sales_channel_id ?? null,
      currencyCode,
    } satisfies ShopifyProductPrerequisites)
  },
)
