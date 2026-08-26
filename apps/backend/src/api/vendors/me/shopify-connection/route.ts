import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { updateVendorWorkflow } from "../../../../workflows/update-vendor"

type SetVendorShopifyConnectionBody = {
  shopify_store_domain?: string
  shopify_client_id?: string
  shopify_client_secret?: string
}

export const PATCH = async (
  req: AuthenticatedMedusaRequest<SetVendorShopifyConnectionBody>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { shopify_store_domain, shopify_client_id, shopify_client_secret } =
    req.body

  if (!shopify_store_domain || !shopify_client_id || !shopify_client_secret) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "shopify_store_domain, shopify_client_id and shopify_client_secret are all required.",
    )
  }

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
  ])

  const { result } = await updateVendorWorkflow(req.scope).run({
    input: {
      id: vendorUser.vendor.id,
      shopify_store_domain,
      shopify_client_id,
      shopify_client_secret,
    },
  })
  const vendor = result as unknown as {
    id: string
    shopify_store_domain: string | null
  }

  res.json({
    vendor: {
      id: vendor.id,
      shopify_store_domain: vendor.shopify_store_domain,
    },
  })
}
