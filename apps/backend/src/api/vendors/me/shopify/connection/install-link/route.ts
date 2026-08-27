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
import { resolveVendorUser } from "../../../../resolve-vendor-user"
import { updateVendorWorkflow } from "../../../../../../workflows/update-vendor"
import { buildShopifyInstallLink } from "../../../../../../integrations/shopify/oauth"

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
      "Set your Shopify store domain and client ID first (PATCH /vendors/me/shopify/connection).",
    )
  }

  const state = crypto.randomUUID()
  await updateVendorWorkflow(req.scope).run({
    input: { id: vendor.id, shopify_oauth_state: state },
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

  const response: VendorShopifyInstallLinkResponse = { installLink }

  res.json(vendorShopifyInstallLinkResponseSchema.parse(response))
}
