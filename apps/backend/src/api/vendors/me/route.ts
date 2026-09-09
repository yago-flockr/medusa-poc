import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsMeResponseSchema } from "@dtc/api-contracts/vendor/me"
import {
  patchVendorsMeResponseSchema,
  type PatchVendorsMeInput,
} from "@dtc/api-contracts/vendor/profile"
import { getVendorMeWorkflow } from "../../../workflows/vendor-me/get-vendor-me"
import { updateVendorMeWorkflow } from "../../../workflows/vendor-me/update-vendor-me"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await getVendorMeWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getVendorsMeResponseSchema.parse(result))
}

export const PATCH = async (
  req: AuthenticatedMedusaRequest<PatchVendorsMeInput>,
  res: MedusaResponse,
) => {
  const { result } = await updateVendorMeWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      first_name: req.validatedBody.first_name,
      last_name: req.validatedBody.last_name,
    },
  })

  res.json(patchVendorsMeResponseSchema.parse(result))
}
