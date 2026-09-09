import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  getVendorsOrdersByIdResponseSchema,
  type PostVendorsOrdersByIdDispatchInput,
} from "@dtc/api-contracts/vendor/orders"
import { dispatchVendorConsignmentWorkflow } from "../../../../../workflows/vendor-consignments/dispatch-vendor-consignment"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsOrdersByIdDispatchInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const { tracking_number, tracking_url } = req.validatedBody

  const { result } = await dispatchVendorConsignmentWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      id,
      trackingNumber: tracking_number,
      trackingUrl: tracking_url,
    },
  })

  res.json(getVendorsOrdersByIdResponseSchema.parse(result))
}
