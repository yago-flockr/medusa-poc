import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../modules/vendor"
import type VendorModuleService from "../../../modules/vendor/service"

export type FindShopifyConnectionByOauthStateStepInput = {
  oauthState: string | undefined
  shopifyStoreDomain: string
}

export const findShopifyConnectionByOauthStateStep = createStep(
  "find-shopify-connection-by-oauth-state",
  async (input: FindShopifyConnectionByOauthStateStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const [connection] = input.oauthState
      ? await vendorModuleService.listVendorIntegrationConnections({
          provider: "shopify",
          oauth_state: input.oauthState,
        })
      : []

    if (!connection) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "This Shopify install link has expired or was already used. Generate a new one and try again.",
      )
    }

    if (connection.external_account_identifier !== input.shopifyStoreDomain) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shopify approved ${input.shopifyStoreDomain}, but this install link was for ${connection.external_account_identifier}.`,
      )
    }

    if (!connection.client_id || !connection.client_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Vendor ${connection.vendor_id} is missing its Shopify client id/secret — set them before generating the install link.`,
      )
    }

    return new StepResponse({
      vendorId: connection.vendor_id,
      clientId: connection.client_id,
      clientSecret: connection.client_secret,
    })
  },
)
