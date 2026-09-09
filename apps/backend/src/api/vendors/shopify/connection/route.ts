import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  patchVendorsShopifyConnectionResponseSchema,
  type PatchVendorsShopifyConnectionInput,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { updateMyShopifyConnectionWorkflow } from "../../../../workflows/vendor-shopify-connection/update-my-shopify-connection"

export const PATCH = async (
  req: AuthenticatedMedusaRequest<PatchVendorsShopifyConnectionInput>,
  res: MedusaResponse,
) => {
  const { result } = await updateMyShopifyConnectionWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      shopify_store_domain: req.validatedBody.shopify_store_domain,
      shopify_client_id: req.validatedBody.shopify_client_id,
      shopify_client_secret: req.validatedBody.shopify_client_secret,
    },
  })

  res.json(patchVendorsShopifyConnectionResponseSchema.parse(result))
}
