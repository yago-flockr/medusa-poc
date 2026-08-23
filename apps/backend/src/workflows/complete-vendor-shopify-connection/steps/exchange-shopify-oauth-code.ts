import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { exchangeShopifyCodeForToken } from "../../../lib/shopify-oauth"

export type ExchangeShopifyOAuthCodeStepInput = {
  shop: string
  clientId: string
  clientSecret: string
  code: string
}

export const exchangeShopifyOAuthCodeStep = createStep(
  "exchange-shopify-oauth-code",
  async (input: ExchangeShopifyOAuthCodeStepInput) => {
    const { access_token, scope } = await exchangeShopifyCodeForToken(
      input.shop,
      input.clientId,
      input.clientSecret,
      input.code,
    )

    return new StepResponse({ access_token, scope, connectedAt: new Date() })
  },
)
