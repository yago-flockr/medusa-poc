import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteVendorsStockLocationsByIdResponseSchema,
  postVendorsStockLocationsResponseSchema,
  type PostVendorsStockLocationsByIdInput,
} from "@dtc/api-contracts/vendor/stock-locations"
import { deleteVendorStockLocationWorkflow } from "../../../../workflows/vendor-stock-locations/delete-vendor-stock-location"
import { updateVendorStockLocationWorkflow } from "../../../../workflows/vendor-stock-locations/update-vendor-stock-location"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsStockLocationsByIdInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const { name, address } = req.validatedBody

  const { result } = await updateVendorStockLocationWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, id, name, address },
  })

  res.json(postVendorsStockLocationsResponseSchema.parse(result))
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await deleteVendorStockLocationWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, id },
  })

  res.json(deleteVendorsStockLocationsByIdResponseSchema.parse(result))
}
