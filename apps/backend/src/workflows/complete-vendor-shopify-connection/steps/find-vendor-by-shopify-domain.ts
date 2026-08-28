import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type FindVendorByShopifyDomainStepInput = {
  shopifyStoreDomain: string
}

export const findVendorByShopifyDomainStep = createStep(
  "find-vendor-by-shopify-domain",
  async (input: FindVendorByShopifyDomainStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const [connection] = await vendorModuleService.listVendorIntegrationConnections({
      provider: "shopify",
      external_account_identifier: input.shopifyStoreDomain,
    })

    if (!connection) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No vendor found with Shopify store domain: ${input.shopifyStoreDomain}`,
      )
    }

    if (!connection.client_id || !connection.client_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Vendor ${connection.vendor_id} is missing its Shopify client id/secret — set them via PATCH /admin/vendors/${connection.vendor_id} before sending the install link.`,
      )
    }

    return new StepResponse({
      vendorId: connection.vendor_id,
      oauthState: connection.oauth_state,
      clientId: connection.client_id,
      clientSecret: connection.client_secret,
    })
  },
)
