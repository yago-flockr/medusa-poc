import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { pullShopifyProducts } from "../../../../../../integrations/shopify/products"
import { assertShopifyConnectionCredentials } from "../../../../../../integrations/shopify/helpers/assert-shopify-connection-credentials"
import { pullVendorShopifyProductsResponseSchema } from "@dtc/api-contracts/admin/vendor-shopify"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    fields: [
      "id",
      "integration_connections.provider",
      "integration_connections.external_account_identifier",
      "integration_connections.access_token",
    ],
  })

  const shopifyConnection = vendor?.integration_connections?.find(
    (connection) => connection?.provider === "shopify",
  )

  assertShopifyConnectionCredentials(shopifyConnection)

  const result = await pullShopifyProducts({
    storeDomain: shopifyConnection.external_account_identifier,
    accessToken: shopifyConnection.access_token,
  })

  res.json(pullVendorShopifyProductsResponseSchema.parse(result))
}
