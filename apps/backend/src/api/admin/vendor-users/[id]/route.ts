import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getVendorUserWorkflow } from "../../../../workflows/vendor-users/get-vendor-user"
import { updateVendorUserWorkflow } from "../../../../workflows/vendor-users/update-vendor-user"
import { deleteVendorUserWorkflow } from "../../../../workflows/vendor-users/delete-vendor-user"
import {
  vendorUserDeleteResponseSchema,
  vendorUserResponseSchema,
  type UpdateVendorUser,
} from "@dtc/api-contracts/admin/vendor-users"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await getVendorUserWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(vendorUserResponseSchema.parse({ vendor_user: result }))
}

export const POST = async (
  req: MedusaRequest<UpdateVendorUser>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await updateVendorUserWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  res.json(vendorUserResponseSchema.parse({ vendor_user: result }))
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteVendorUserWorkflow(req.scope).run({
    input: { id },
  })

  res.json(
    vendorUserDeleteResponseSchema.parse({
      id,
      object: "vendor_user",
      deleted: true,
    }),
  )
}
