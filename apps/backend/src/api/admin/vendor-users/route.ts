import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listVendorUsersWorkflow } from "../../../workflows/vendor-users/list-vendor-users"
import { createVendorUserWorkflow } from "../../../workflows/vendor-users/create-vendor-user"
import {
  vendorUserListResponseSchema,
  vendorUserWithPasswordResponseSchema,
  type CreateVendorUser,
} from "@dtc/api-contracts/admin/vendor-users"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listVendorUsersWorkflow(req.scope).run({
    input: { filters: req.filterableFields, queryConfig: req.queryConfig },
  })

  res.json(vendorUserListResponseSchema.parse(result))
}

export const POST = async (
  req: MedusaRequest<CreateVendorUser>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorUserWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json(vendorUserWithPasswordResponseSchema.parse(result))
}
