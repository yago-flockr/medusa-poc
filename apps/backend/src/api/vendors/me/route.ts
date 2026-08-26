import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  vendorMeResponseSchema,
  type VendorMeResponse,
} from "@dtc/api-contracts/vendor/me"
import { resolveVendorUser } from "../resolve-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "id",
    "first_name",
    "last_name",
    "email",
    "vendor.id",
    "vendor.name",
    "vendor.handle",
    "vendor.shopify_store_domain",
    "vendor.shopify_client_id",
    "vendor.shopify_connected_at",
    "vendor.shopify_access_token",
  ])

  const response: VendorMeResponse = {
    vendor_user: {
      id: vendorUser.id,
      first_name: vendorUser.first_name,
      last_name: vendorUser.last_name,
      email: vendorUser.email,
    },
    vendor: {
      id: vendorUser.vendor.id,
      name: vendorUser.vendor.name,
      handle: vendorUser.vendor.handle,
      shopify_store_domain: vendorUser.vendor.shopify_store_domain,
      shopify_client_id: vendorUser.vendor.shopify_client_id,
      shopify_connected_at: vendorUser.vendor.shopify_connected_at
        ? new Date(vendorUser.vendor.shopify_connected_at).toISOString()
        : null,
      shopify_connected: Boolean(vendorUser.vendor.shopify_access_token),
    },
  }

  res.json(vendorMeResponseSchema.parse(response))
}
