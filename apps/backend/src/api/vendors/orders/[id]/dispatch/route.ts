import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  getVendorsOrdersByIdResponseSchema,
  type PostVendorsOrdersByIdDispatchInput,
} from "@dtc/api-contracts/vendor/orders"
import { dispatchVendorOrderWorkflow } from "../../../../../workflows/dispatch-vendor-order"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { assertOwnedVendorOrder } from "../../assert-owned-order"
import { buildVendorOrderDetail } from "../../build-order-detail"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsOrdersByIdDispatchInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorOrder(query, id, vendorUser.vendor_id)

  const current = await buildVendorOrderDetail(req.scope, id)

  if (current.consignment_status !== "accepted") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Accept this order before dispatching it.",
    )
  }

  const { tracking_number, tracking_url } = req.validatedBody

  await dispatchVendorOrderWorkflow(req.scope).run({
    input: {
      orderId: id,
      items: current.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      trackingNumber: tracking_number,
      trackingUrl: tracking_url,
    },
  })

  const detail = await buildVendorOrderDetail(req.scope, id)

  res.json(getVendorsOrdersByIdResponseSchema.parse(detail))
}
