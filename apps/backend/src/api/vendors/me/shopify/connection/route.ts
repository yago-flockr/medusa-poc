import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  setVendorShopifyConnectionResponseSchema,
  type SetVendorShopifyConnectionInput,
  type SetVendorShopifyConnectionResponse,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { updateVendorWorkflow } from "../../../../../workflows/update-vendor"

export const PATCH = async (
  req: AuthenticatedMedusaRequest<SetVendorShopifyConnectionInput>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { shopify_store_domain, shopify_client_id, shopify_client_secret } =
    req.validatedBody

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
  ])

  const { result } = await updateVendorWorkflow(req.scope).run({
    input: {
      id: vendorUser.vendor.id,
      integration_connection: {
        provider: "shopify",
        external_account_identifier: shopify_store_domain,
        client_id: shopify_client_id,
        client_secret: shopify_client_secret,
      },
    },
  })

  const response: SetVendorShopifyConnectionResponse = {
    vendor: {
      id: vendorUser.vendor.id,
      shopify_store_domain:
        result.integration_connection?.external_account_identifier ?? null,
    },
  }

  res.json(setVendorShopifyConnectionResponseSchema.parse(response))
}
