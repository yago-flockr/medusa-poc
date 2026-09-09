import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { getVendorsOrdersByIdResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { acceptConsignmentWorkflow } from "../../../../../workflows/accept-consignment"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { assertOwnedConsignment } from "../../assert-owned-consignment"
import { buildConsignmentDetail } from "../../build-consignment-detail"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedConsignment(query, id, vendorUser.vendor_id)

  const current = await buildConsignmentDetail(req.scope, id)

  if (current.consignment_status !== "placed") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This order has already been accepted.",
    )
  }

  await acceptConsignmentWorkflow(req.scope).run({
    input: { consignmentId: id },
  })

  const detail = await buildConsignmentDetail(req.scope, id)

  res.json(getVendorsOrdersByIdResponseSchema.parse(detail))
}
