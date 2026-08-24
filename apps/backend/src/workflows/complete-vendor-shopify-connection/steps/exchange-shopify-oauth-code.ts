import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { exchangeShopifyCodeForToken, uninstallShopifyApp } from "../../../lib/shopify-oauth"

export type ExchangeShopifyOAuthCodeStepInput = {
  shop: string
  clientId: string
  clientSecret: string
  code: string
}

type ExchangeShopifyOAuthCodeCompensation = {
  shop: string
  accessToken: string
}

export const exchangeShopifyOAuthCodeStep = createStep(
  "exchange-shopify-o-auth-code",
  async (input: ExchangeShopifyOAuthCodeStepInput) => {
    const { access_token, scope } = await exchangeShopifyCodeForToken(
      input.shop,
      input.clientId,
      input.clientSecret,
      input.code,
    )

    return new StepResponse(
      { access_token, scope, connectedAt: new Date() },
      { shop: input.shop, accessToken: access_token } satisfies ExchangeShopifyOAuthCodeCompensation,
    )
  },
  async (compensation: ExchangeShopifyOAuthCodeCompensation | undefined) => {
    if (!compensation) {
      return
    }

    await uninstallShopifyApp(compensation.shop, compensation.accessToken)
  },
)
