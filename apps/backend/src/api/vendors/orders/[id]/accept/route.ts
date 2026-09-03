import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { getVendorsOrdersByIdResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { acceptVendorOrderWorkflow } from "../../../../../workflows/accept-vendor-order"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { assertOwnedVendorOrder } from "../../assert-owned-order"
import { buildVendorOrderDetail } from "../../build-order-detail"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorOrder(query, id, vendorUser.vendor_id)

  const current = await buildVendorOrderDetail(req.scope, id)

  if (current.consignment_status !== "placed") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This order has already been accepted.",
    )
  }

  await acceptVendorOrderWorkflow(req.scope).run({ input: { orderId: id } })

  const detail = await buildVendorOrderDetail(req.scope, id)

  res.json(getVendorsOrdersByIdResponseSchema.parse(detail))
}
