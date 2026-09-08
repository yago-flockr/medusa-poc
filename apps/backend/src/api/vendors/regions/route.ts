import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsRegionsResponseSchema } from "@dtc/api-contracts/vendor/regions"
import { listVendorRegionsWorkflow } from "../../../workflows/vendor-regions/list-vendor-regions"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await listVendorRegionsWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getVendorsRegionsResponseSchema.parse(result))
}
