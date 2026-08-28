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
import { assertShopifyConnectionCredentials } from "../../../../../integrations/shopify/helpers/assert-shopify-connection-credentials"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.integration_connections.provider",
    "vendor.integration_connections.external_account_identifier",
    "vendor.integration_connections.access_token",
  ])
  const shopifyConnection = vendorUser.vendor.integration_connections?.find(
    (connection) => connection?.provider === "shopify",
  )

  assertShopifyConnectionCredentials(shopifyConnection)

  const pulled = await pullShopifyProducts({
    storeDomain: shopifyConnection.external_account_identifier,
    accessToken: shopifyConnection.access_token,
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
