import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildShopifyInstallLink } from "../../integrations/shopify/oauth"
import { upsertVendorIntegrationConnectionStep } from "../shared/steps/upsert-vendor-integration-connection"
import { resolveVendorShopifyConnectionStep } from "./steps/resolve-vendor-shopify-connection"
import { generateOauthStateStep } from "./steps/generate-oauth-state"

export type GenerateVendorShopifyInstallLinkWorkflowInput = {
  vendorId: string
  notConfiguredMessage: string
  protocol: string
  host: string
}

export const generateVendorShopifyInstallLinkWorkflow = createWorkflow(
  "generate-vendor-shopify-install-link",
  function (input: GenerateVendorShopifyInstallLinkWorkflowInput) {
    const resolveVendorShopifyConnection = resolveVendorShopifyConnectionStep({
      vendorId: input.vendorId,
      notConfiguredMessage: input.notConfiguredMessage,
    })

    const generateOauthState = generateOauthStateStep()

    upsertVendorIntegrationConnectionStep({
      vendor_id: input.vendorId,
      provider: "shopify",
      oauth_state: generateOauthState,
    })

    const response = transform(
      { input, resolveVendorShopifyConnection, generateOauthState },
      (data) => ({
        install_link: buildShopifyInstallLink({
          storeDomain: data.resolveVendorShopifyConnection.storeDomain,
          clientId: data.resolveVendorShopifyConnection.clientId,
          state: data.generateOauthState,
          protocol: data.input.protocol,
          host: data.input.host,
        }),
      }),
    )

    return new WorkflowResponse(response)
  },
)
