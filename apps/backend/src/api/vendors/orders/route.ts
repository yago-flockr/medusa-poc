import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsOrdersResponseSchema } from "@dtc/api-contracts/vendor/orders"
import { listVendorConsignmentsWorkflow } from "../../../workflows/vendor-consignments/list-vendor-consignments"
import { parseListQuery } from "../../../lib/list-query"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { limit, offset } = parseListQuery(req.query)

  const { result } = await listVendorConsignmentsWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, limit, offset },
  })

  res.json(getVendorsOrdersResponseSchema.parse(result))
}
