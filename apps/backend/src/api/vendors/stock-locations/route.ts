import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  postVendorsStockLocationsResponseSchema,
  getVendorsStockLocationsResponseSchema,
  type PostVendorsStockLocationsInput,
} from "@dtc/api-contracts/vendor/stock-locations"
import { createVendorStockLocationWorkflow } from "../../../workflows/vendor-stock-locations/create-vendor-stock-location"
import { listVendorStockLocationsWorkflow } from "../../../workflows/vendor-stock-locations/list-vendor-stock-locations"
import { parseListQuery } from "../../../lib/list-query"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { limit, offset } = parseListQuery(req.query)

  const { result } = await listVendorStockLocationsWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, limit, offset },
  })

  res.json(getVendorsStockLocationsResponseSchema.parse(result))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsStockLocationsInput>,
  res: MedusaResponse,
) => {
  const { name, address } = req.validatedBody

  const { result } = await createVendorStockLocationWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, name, address },
  })

  res.json(postVendorsStockLocationsResponseSchema.parse(result))
}
