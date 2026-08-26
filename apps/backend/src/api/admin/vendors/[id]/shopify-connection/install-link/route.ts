import crypto from "node:crypto"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../../../../modules/vendor"
import type VendorModuleService from "../../../../../../modules/vendor/service"
import { updateVendorWorkflow } from "../../../../../../workflows/update-vendor"
import { buildShopifyInstallLink } from "../../../../../../lib/shopify-oauth"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const vendorModuleService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
  const vendor = await vendorModuleService.retrieveVendor(id)

  if (!vendor.shopify_store_domain || !vendor.shopify_client_id || !vendor.shopify_client_secret) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Vendor ${id} is missing shopify_store_domain/shopify_client_id/shopify_client_secret — set them via PATCH /admin/vendors/${id} first.`,
    )
  }

  const state = crypto.randomUUID()
  await updateVendorWorkflow(req.scope).run({
    input: { id, shopify_oauth_state: state },
  })

  const host = req.get("x-forwarded-host") ?? req.get("host")
  if (!host) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Request is missing a Host header")
  }

  const installLink = buildShopifyInstallLink({
    storeDomain: vendor.shopify_store_domain,
    clientId: vendor.shopify_client_id,
    state,
    protocol: req.get("x-forwarded-proto") ?? req.protocol,
    host,
  })

  res.json({ installLink })
}
