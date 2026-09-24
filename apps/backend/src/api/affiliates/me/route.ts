import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAffiliatesMeResponseSchema } from "@dtc/api-contracts/affiliate/me"
import {
  patchAffiliatesMeResponseSchema,
  type PatchAffiliatesMeInput,
} from "@dtc/api-contracts/affiliate/profile"
import { getAffiliateMeWorkflow } from "../../../workflows/affiliate-me/get-affiliate-me"
import { updateAffiliateMeWorkflow } from "../../../workflows/affiliate-me/update-affiliate-me"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await getAffiliateMeWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getAffiliatesMeResponseSchema.parse(result))
}

export const PATCH = async (
  req: AuthenticatedMedusaRequest<PatchAffiliatesMeInput>,
  res: MedusaResponse,
) => {
  const { result } = await updateAffiliateMeWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      name: req.validatedBody.name,
    },
  })

  res.json(patchAffiliatesMeResponseSchema.parse(result))
}
