import crypto from "node:crypto"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { updateVendorWorkflow } from "../../../../../../../workflows/update-vendor"
import { buildShopifyInstallLink } from "../../../../../../../integrations/shopify/oauth"
import { vendorShopifyInstallLinkResponseSchema } from "@dtc/api-contracts/vendor/shopify-connection"

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
      "integration_connections.client_id",
      "integration_connections.client_secret",
    ],
  })

  const shopifyConnection = vendor?.integration_connections?.find(
    (connection) => connection?.provider === "shopify",
  )

  if (
    !shopifyConnection?.external_account_identifier ||
    !shopifyConnection.client_id ||
    !shopifyConnection.client_secret
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Vendor ${id} is missing its Shopify store domain/client id/client secret — set them via PATCH /admin/vendors/${id} first.`,
    )
  }

  const state = crypto.randomUUID()
  await updateVendorWorkflow(req.scope).run({
    input: {
      id,
      integration_connection: { provider: "shopify", oauth_state: state },
    },
  })

  const host = req.get("x-forwarded-host") ?? req.get("host")
  if (!host) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Request is missing a Host header")
  }

  const installLink = buildShopifyInstallLink({
    storeDomain: shopifyConnection.external_account_identifier,
    clientId: shopifyConnection.client_id,
    state,
    protocol: req.get("x-forwarded-proto") ?? req.protocol,
    host,
  })

  res.json(vendorShopifyInstallLinkResponseSchema.parse({ installLink }))
}
