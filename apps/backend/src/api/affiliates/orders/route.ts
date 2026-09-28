import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAffiliatesOrdersResponseSchema } from "@dtc/api-contracts/affiliate/orders"
import { listAffiliateOrdersWorkflow } from "../../../workflows/affiliate-orders/list-affiliate-orders"
import { parseListQuery } from "../../../lib/list-query"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { limit, offset } = parseListQuery(req.query)

  const { result } = await listAffiliateOrdersWorkflow(req.scope).run({
    input: { affiliate_id: req.auth_context.actor_id, limit, offset },
  })

  res.json(getAffiliatesOrdersResponseSchema.parse(result))
}
