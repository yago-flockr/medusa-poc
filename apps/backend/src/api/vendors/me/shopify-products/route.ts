import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  pullVendorShopifyProductsResponseSchema,
  type PullVendorShopifyProductsResponse,
} from "@dtc/api-contracts/vendor/shopify-products"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { pullShopifyProducts } from "../../../../lib/shopify-products"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.name",
    "vendor.shopify_store_domain",
    "vendor.shopify_access_token",
  ])
  const { vendor } = vendorUser

  if (!vendor.shopify_store_domain || !vendor.shopify_access_token) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This vendor isn't connected to Shopify yet.",
    )
  }

  const result: PullVendorShopifyProductsResponse = await pullShopifyProducts({
    storeDomain: vendor.shopify_store_domain,
    accessToken: vendor.shopify_access_token,
  })

  console.log(
    `[vendors/me/shopify-products] pulled ${result.products.length} product(s) for vendor "${vendor.name}" (${vendor.shopify_store_domain}):`,
    JSON.stringify(result.products, null, 2),
  )

  res.json(pullVendorShopifyProductsResponseSchema.parse(result))
}
