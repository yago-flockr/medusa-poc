import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getVendorsOrdersByIdResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { assertOwnedVendorOrder } from "../assert-owned-order"
import { buildVendorOrderDetail } from "../build-order-detail"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorOrder(query, id, vendorUser.vendor_id)

  const detail = await buildVendorOrderDetail(req.scope, id)

  res.json(getVendorsOrdersByIdResponseSchema.parse(detail))
}
