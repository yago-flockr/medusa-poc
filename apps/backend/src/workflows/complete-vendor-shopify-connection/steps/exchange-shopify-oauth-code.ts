import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { exchangeShopifyCodeForToken } from "../../../lib/shopify-oauth"

export type ExchangeShopifyOAuthCodeStepInput = {
  shop: string
  clientId: string
  clientSecret: string
  code: string
}

/**
 * Nothing on our side to compensate — the only side effect (granting our
 * app a token) already happened on Shopify's side when the vendor approved
 * the install; this step just retrieves it.
 */
export const exchangeShopifyOAuthCodeStep = createStep(
  "exchange-shopify-oauth-code",
  async (input: ExchangeShopifyOAuthCodeStepInput) => {
    const { access_token, scope } = await exchangeShopifyCodeForToken(
      input.shop,
      input.clientId,
      input.clientSecret,
      input.code,
    )

    // Stamped here, not in the workflow body — a workflow can replay, and
    // a bare `new Date()` in the orchestration function would drift on
    // every replay instead of being recorded once like a step's result is.
    return new StepResponse({ access_token, scope, connectedAt: new Date() })
  },
)
