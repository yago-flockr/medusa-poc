import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAffiliatesOrdersByIdResponseSchema } from "@dtc/api-contracts/affiliate/orders"
import { getAffiliateOrderWorkflow } from "../../../../workflows/affiliate-orders/get-affiliate-order"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await getAffiliateOrderWorkflow(req.scope).run({
    input: { affiliate_id: req.auth_context.actor_id, id: req.params.id },
  })

  res.json(getAffiliatesOrdersByIdResponseSchema.parse(result))
}
