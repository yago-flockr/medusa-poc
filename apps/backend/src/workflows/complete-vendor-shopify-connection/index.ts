import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { findVendorByShopifyDomainStep } from "./steps/find-vendor-by-shopify-domain"
import { verifyShopifyCallbackHmacStep } from "./steps/verify-shopify-callback-hmac"
import { verifyShopifyOAuthStateStep } from "./steps/verify-shopify-oauth-state"
import { exchangeShopifyOAuthCodeStep } from "./steps/exchange-shopify-oauth-code"
import { upsertVendorIntegrationConnectionStep } from "../shared/steps/upsert-vendor-integration-connection"

export type CompleteVendorShopifyConnectionWorkflowInput = {
  shop: string
  code: string
  query: Record<string, string>
}

export const completeVendorShopifyConnectionWorkflow = createWorkflow(
  "complete-vendor-shopify-connection",
  function (input: CompleteVendorShopifyConnectionWorkflowInput) {
    const found = findVendorByShopifyDomainStep({
      shopifyStoreDomain: input.shop,
    })

    verifyShopifyCallbackHmacStep({
      query: input.query,
      clientSecret: found.clientSecret,
    })

    verifyShopifyOAuthStateStep({
      expectedState: found.oauthState,
      actualState: input.query.state,
    })

    const { access_token, scope, connectedAt } = exchangeShopifyOAuthCodeStep({
      shop: input.shop,
      clientId: found.clientId,
      clientSecret: found.clientSecret,
      code: input.code,
    })

    const connection = upsertVendorIntegrationConnectionStep({
      vendor_id: found.vendorId,
      provider: "shopify",
      access_token,
      scope,
      connected_at: connectedAt,
      oauth_state: null,
    })

    return new WorkflowResponse(connection)
  },
)
