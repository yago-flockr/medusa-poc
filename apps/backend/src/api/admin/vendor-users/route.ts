import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVendorUserWorkflow } from "../../../workflows/create-vendor-user"
import type { CreateVendorUser } from "@dtc/api-contracts/admin/vendor-users"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: vendorUsers,
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "vendor_user",
    filters: req.filterableFields,
    ...req.queryConfig,
  })

  res.json({
    vendor_users: vendorUsers,
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: MedusaRequest<CreateVendorUser>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorUserWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  const { password, ...vendor_user } = result

  res.json({ vendor_user, password })
}
