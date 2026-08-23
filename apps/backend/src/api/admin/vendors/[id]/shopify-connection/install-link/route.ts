import crypto from "node:crypto"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../../../../modules/vendor"
import type VendorModuleService from "../../../../../../modules/vendor/service"

const SHOPIFY_OAUTH_SCOPES = "read_products,read_inventory"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const vendorModuleService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
  const vendor = await vendorModuleService.retrieveVendor(id)

  if (!vendor.shopify_store_domain || !vendor.shopify_client_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Vendor ${id} is missing shopify_store_domain/shopify_client_id — set them via PATCH /admin/vendors/${id} first.`,
    )
  }

  const protocol = req.get("x-forwarded-proto") ?? req.protocol
  const host = req.get("x-forwarded-host") ?? req.get("host")
  const redirectUri = `${protocol}://${host}/hooks/shopify/oauth/callback`

  const installLink = `https://${vendor.shopify_store_domain}/admin/oauth/authorize?${new URLSearchParams(
    {
      client_id: vendor.shopify_client_id,
      scope: SHOPIFY_OAUTH_SCOPES,
      redirect_uri: redirectUri,
      state: crypto.randomUUID(),
    },
  ).toString()}`

  res.json({ installLink })
}
