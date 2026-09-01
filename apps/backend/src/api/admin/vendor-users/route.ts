import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVendorUserWorkflow } from "../../../workflows/create-vendor-user"
import { toIsoString } from "../../../lib/normalize-timestamps"
import {
  vendorUserListResponseSchema,
  vendorUserWithPasswordResponseSchema,
  type CreateVendorUser,
} from "@dtc/api-contracts/admin/vendor-users"

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

  res.json(
    vendorUserListResponseSchema.parse({
      vendor_users: vendorUsers.map((vendorUser) => ({
        ...vendorUser,
        created_at: toIsoString(vendorUser.created_at),
        updated_at: toIsoString(vendorUser.updated_at),
      })),
      count,
      limit: take,
      offset: skip,
    }),
  )
}

export const POST = async (
  req: MedusaRequest<CreateVendorUser>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorUserWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  const { password, ...vendor_user } = result

  res.json(
    vendorUserWithPasswordResponseSchema.parse({
      vendor_user: {
        ...vendor_user,
        created_at: toIsoString(vendor_user.created_at),
        updated_at: toIsoString(vendor_user.updated_at),
      },
      password,
    }),
  )
}
