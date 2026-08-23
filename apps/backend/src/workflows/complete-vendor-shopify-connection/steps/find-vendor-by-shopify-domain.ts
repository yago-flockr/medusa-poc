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

    const [vendor] = await vendorModuleService.listVendors({
      shopify_store_domain: input.shopifyStoreDomain,
    })

    if (!vendor) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No vendor found with shopify_store_domain: ${input.shopifyStoreDomain}`,
      )
    }

    const { shopify_client_id, shopify_client_secret } = vendor
    if (!shopify_client_id || !shopify_client_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Vendor ${vendor.id} is missing shopify_client_id/shopify_client_secret — set them via PATCH /admin/vendors/${vendor.id} before sending the install link.`,
      )
    }

    return new StepResponse({ ...vendor, shopify_client_id, shopify_client_secret })
  },
)
