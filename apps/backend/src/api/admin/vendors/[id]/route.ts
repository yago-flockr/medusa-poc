import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { updateVendorWorkflow } from "../../../../workflows/update-vendor"
import { deleteVendorWorkflow } from "../../../../workflows/delete-vendor"
import { mapVendorConnectionFields } from "../map-vendor-response"
import type { UpdateVendor } from "@dtc/api-contracts/admin/vendors"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    ...req.queryConfig,
  })

  if (!vendor) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor with id: ${id} was not found`,
    )
  }

  res.json({ vendor: mapVendorConnectionFields(vendor) })
}

export const POST = async (
  req: MedusaRequest<UpdateVendor>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  await updateVendorWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    ...req.queryConfig,
  })

  res.json({ vendor: mapVendorConnectionFields(vendor) })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteVendorWorkflow(req.scope).run({
    input: { id },
  })

  res.json({
    id,
    object: "vendor",
    deleted: true,
  })
}
