import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  pullVendorShopifyProductsResponseSchema,
  type PullVendorShopifyProductsResponse,
} from "@dtc/api-contracts/vendor/shopify-products"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { pullShopifyProducts } from "../../../../../integrations/shopify/products"
import { findExistingShopifyProductIds } from "../../../../../integrations/shopify/helpers/resolve-existing-products"
import { assertVendorHasShopifyCredentials } from "../../../../../integrations/shopify/helpers/assert-vendor-has-shopify-credentials"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.shopify_store_domain",
    "vendor.shopify_access_token",
  ])
  const { vendor } = vendorUser

  assertVendorHasShopifyCredentials(vendor)

  const pulled = await pullShopifyProducts({
    storeDomain: vendor.shopify_store_domain,
    accessToken: vendor.shopify_access_token,
  })

  const existingIds = await findExistingShopifyProductIds(
    query,
    pulled.products.map((product) => product.shopify_id),
  )

  const result: PullVendorShopifyProductsResponse = {
    ...pulled,
    products: pulled.products.map((product) => ({
      ...product,
      already_imported: existingIds.has(product.shopify_id),
    })),
  }

  res.json(pullVendorShopifyProductsResponseSchema.parse(result))
}
