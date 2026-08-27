import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../../../../modules/vendor"
import type VendorModuleService from "../../../../../../modules/vendor/service"
import { pullShopifyProducts } from "../../../../../../integrations/shopify/products"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const vendorModuleService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
  const vendor = await vendorModuleService.retrieveVendor(id)

  if (!vendor.shopify_store_domain || !vendor.shopify_access_token) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Vendor ${id} has no completed Shopify connection yet.`,
    )
  }

  const result = await pullShopifyProducts({
    storeDomain: vendor.shopify_store_domain,
    accessToken: vendor.shopify_access_token,
  })

  res.json(result)
}
