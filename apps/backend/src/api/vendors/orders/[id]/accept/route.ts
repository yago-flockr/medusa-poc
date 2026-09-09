import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsOrdersByIdResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { acceptVendorConsignmentWorkflow } from "../../../../../workflows/vendor-consignments/accept-vendor-consignment"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await acceptVendorConsignmentWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, id },
  })

  res.json(getVendorsOrdersByIdResponseSchema.parse(result))
}
