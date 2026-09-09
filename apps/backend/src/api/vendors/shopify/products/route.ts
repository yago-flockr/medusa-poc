import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsShopifyProductsResponseSchema } from "@dtc/api-contracts/vendor/shopify-products"
import { listMyShopifyProductsWorkflow } from "../../../../workflows/vendor-shopify-products/list-my-shopify-products"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await listMyShopifyProductsWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getVendorsShopifyProductsResponseSchema.parse(result))
}
