import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { findVendorByShopifyDomainStep } from "./steps/find-vendor-by-shopify-domain"
import { verifyShopifyCallbackHmacStep } from "./steps/verify-shopify-callback-hmac"
import { verifyShopifyOAuthStateStep } from "./steps/verify-shopify-oauth-state"
import { exchangeShopifyOAuthCodeStep } from "./steps/exchange-shopify-oauth-code"
import { updateVendorStep } from "../update-vendor/steps/update-vendor"

export type CompleteVendorShopifyConnectionWorkflowInput = {
  shop: string
  code: string
  query: Record<string, string>
}

export const completeVendorShopifyConnectionWorkflow = createWorkflow(
  "complete-vendor-shopify-connection",
  function (input: CompleteVendorShopifyConnectionWorkflowInput) {
    const vendor = findVendorByShopifyDomainStep({
      shopifyStoreDomain: input.shop,
    })

    verifyShopifyCallbackHmacStep({
      query: input.query,
      clientSecret: vendor.shopify_client_secret,
    })

    verifyShopifyOAuthStateStep({
      expectedState: vendor.shopify_oauth_state,
      actualState: input.query.state,
    })

    const { access_token, scope, connectedAt } = exchangeShopifyOAuthCodeStep({
      shop: input.shop,
      clientId: vendor.shopify_client_id,
      clientSecret: vendor.shopify_client_secret,
      code: input.code,
    })

    const updatedVendor = updateVendorStep({
      id: vendor.id,
      shopify_access_token: access_token,
      shopify_scope: scope,
      shopify_connected_at: connectedAt,
      shopify_oauth_state: null,
    })

    return new WorkflowResponse(updatedVendor)
  },
)
