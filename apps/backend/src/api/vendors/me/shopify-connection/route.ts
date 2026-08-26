import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  setVendorShopifyConnectionSchema,
  setVendorShopifyConnectionResponseSchema,
  type SetVendorShopifyConnectionInput,
  type SetVendorShopifyConnectionResponse,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { updateVendorWorkflow } from "../../../../workflows/update-vendor"

export const PATCH = async (
  req: AuthenticatedMedusaRequest<SetVendorShopifyConnectionInput>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const parsed = setVendorShopifyConnectionSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid Shopify connection payload: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join("; ")}`,
    )
  }

  const { shopify_store_domain, shopify_client_id, shopify_client_secret } =
    parsed.data

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

  const response: SetVendorShopifyConnectionResponse = {
    vendor: {
      id: vendor.id,
      shopify_store_domain: vendor.shopify_store_domain,
    },
  }

  res.json(setVendorShopifyConnectionResponseSchema.parse(response))
}
