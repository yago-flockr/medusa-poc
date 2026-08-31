import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { updateVendorUserWorkflow } from "../../../../workflows/update-vendor-user"
import type { UpdateVendorUser } from "@dtc/api-contracts/admin/vendor-users"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [vendorUser],
  } = await query.graph({
    entity: "vendor_user",
    filters: { id },
    ...req.queryConfig,
  })

  if (!vendorUser) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor user with id: ${id} was not found`,
    )
  }

  res.json({ vendor_user: vendorUser })
}

export const POST = async (
  req: MedusaRequest<UpdateVendorUser>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await updateVendorUserWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json({ vendor_user: result })
}
