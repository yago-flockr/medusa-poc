import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAffiliatesMeResponseSchema } from "@dtc/api-contracts/affiliate/me"
import { getAffiliateMeWorkflow } from "../../../workflows/affiliate-me/get-affiliate-me"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await getAffiliateMeWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getAffiliatesMeResponseSchema.parse(result))
}
