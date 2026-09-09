import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsOrdersByIdResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { getVendorConsignmentWorkflow } from "../../../../workflows/vendor-consignments/get-vendor-consignment"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await getVendorConsignmentWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, id },
  })

  res.json(getVendorsOrdersByIdResponseSchema.parse(result))
}
