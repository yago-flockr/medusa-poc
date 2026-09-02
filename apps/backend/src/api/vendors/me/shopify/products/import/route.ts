import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  postVendorsMeShopifyProductsImportResponseSchema,
  type PostVendorsMeShopifyProductsImportInput,
  type PostVendorsMeShopifyProductsImportResponse,
} from "@dtc/api-contracts/vendor/shopify-products"
import { resolveVendorUser } from "../../../../resolve-vendor-user"
import { importVendorShopifyProductsWorkflow } from "../../../../../../workflows/import-vendor-shopify-products"
import { assertShopifyConnectionCredentials } from "../../../../../../integrations/shopify/helpers/assert-shopify-connection-credentials"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsMeShopifyProductsImportInput>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.id",
    "vendor.integration_connections.provider",
    "vendor.integration_connections.external_account_identifier",
    "vendor.integration_connections.access_token",
  ])
  const { vendor } = vendorUser
  const shopifyConnection = vendor.integration_connections?.find(
    (connection) => connection?.provider === "shopify",
  )

  assertShopifyConnectionCredentials(shopifyConnection)

  const { result } = await importVendorShopifyProductsWorkflow(req.scope).run({
    input: {
      vendorId: vendor.id,
      credentials: {
        storeDomain: shopifyConnection.external_account_identifier,
        accessToken: shopifyConnection.access_token,
      },
      shopifyProductIds: req.validatedBody.shopify_product_ids,
    },
  })

  const response: PostVendorsMeShopifyProductsImportResponse = result

  res.json(postVendorsMeShopifyProductsImportResponseSchema.parse(response))
}
