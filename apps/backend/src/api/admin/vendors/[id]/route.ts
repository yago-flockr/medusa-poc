import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { updateVendorWorkflow } from "../../../../workflows/update-vendor"
import { withShopifyConnectionFields } from "../map-vendor-response"
import type { UpdateVendor } from "../contract"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    ...req.queryConfig,
  })

  if (!vendor) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor with id: ${id} was not found`,
    )
  }

  res.json({ vendor: withShopifyConnectionFields(vendor) })
}

export const POST = async (
  req: MedusaRequest<UpdateVendor>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { shopify_store_domain, shopify_client_id, shopify_client_secret, ...vendorFields } =
    req.validatedBody
  const hasConnectionUpdate =
    shopify_store_domain !== undefined ||
    shopify_client_id !== undefined ||
    shopify_client_secret !== undefined

  await updateVendorWorkflow(req.scope).run({
    input: {
      id,
      ...vendorFields,
      ...(hasConnectionUpdate && {
        integration_connection: {
          provider: "shopify",
          external_account_identifier: shopify_store_domain,
          client_id: shopify_client_id,
          client_secret: shopify_client_secret,
        },
      }),
    },
  })

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    ...req.queryConfig,
  })

  res.json({ vendor: withShopifyConnectionFields(vendor) })
}
