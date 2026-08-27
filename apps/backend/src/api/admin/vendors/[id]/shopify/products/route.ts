import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../../../../modules/vendor"
import type VendorModuleService from "../../../../../../modules/vendor/service"
import { pullShopifyProducts } from "../../../../../../integrations/shopify/products"
import { assertVendorHasShopifyCredentials } from "../../../../../../integrations/shopify/helpers/assert-vendor-has-shopify-credentials"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const vendorModuleService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
  const vendor = await vendorModuleService.retrieveVendor(id)

  assertVendorHasShopifyCredentials(vendor)

  const result = await pullShopifyProducts({
    storeDomain: vendor.shopify_store_domain,
    accessToken: vendor.shopify_access_token,
  })

  res.json(result)
}
