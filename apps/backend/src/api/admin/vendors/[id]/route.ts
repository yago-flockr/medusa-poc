import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getVendorWorkflow } from "../../../../workflows/vendors/get-vendor"
import { updateVendorWorkflow } from "../../../../workflows/vendors/update-vendor"
import { deleteVendorWorkflow } from "../../../../workflows/vendors/delete-vendor"
import {
  vendorDeleteResponseSchema,
  vendorResponseSchema,
  type UpdateVendor,
} from "@dtc/api-contracts/admin/vendors"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await getVendorWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(vendorResponseSchema.parse({ vendor: result }))
}

export const POST = async (
  req: MedusaRequest<UpdateVendor>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  await updateVendorWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  const { result } = await getVendorWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(vendorResponseSchema.parse({ vendor: result }))
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteVendorWorkflow(req.scope).run({
    input: { id },
  })

  res.json(
    vendorDeleteResponseSchema.parse({
      id,
      object: "vendor",
      deleted: true,
    }),
  )
}
