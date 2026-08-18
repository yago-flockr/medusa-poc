import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createVendorWorkflow } from "../../workflows/create-vendor"
import type { CreateVendor } from "./contract"

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateVendor>,
  res: MedusaResponse,
) => {
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor.",
    )
  }

  const { result } = await createVendorWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      authIdentityId: req.auth_context.auth_identity_id,
    },
  })

  res.json({ vendor: result.vendor })
}
