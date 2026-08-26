import crypto from "node:crypto"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  vendorShopifyInstallLinkResponseSchema,
  type VendorShopifyInstallLinkResponse,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { updateVendorWorkflow } from "../../../../../workflows/update-vendor"

const SHOPIFY_OAUTH_SCOPES = "read_products,read_inventory"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.shopify_store_domain",
    "vendor.shopify_client_id",
  ])
  const { vendor } = vendorUser

  if (!vendor.shopify_store_domain || !vendor.shopify_client_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Set your Shopify store domain and client ID first (PATCH /vendors/me/shopify-connection).",
    )
  }

  const state = crypto.randomUUID()
  await updateVendorWorkflow(req.scope).run({
    input: { id: vendor.id, shopify_oauth_state: state },
  })

  const protocol = req.get("x-forwarded-proto") ?? req.protocol
  const host = req.get("x-forwarded-host") ?? req.get("host")
  const redirectUri = `${protocol}://${host}/hooks/shopify/oauth/callback`

  const installLink = `https://${vendor.shopify_store_domain}/admin/oauth/authorize?${new URLSearchParams(
    {
      client_id: vendor.shopify_client_id,
      scope: SHOPIFY_OAUTH_SCOPES,
      redirect_uri: redirectUri,
      state,
    },
  ).toString()}`

  const response: VendorShopifyInstallLinkResponse = { installLink }

  res.json(vendorShopifyInstallLinkResponseSchema.parse(response))
}
