import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVendorWorkflow } from "../../../workflows/create-vendor"
import { mapVendorConnectionFields } from "./map-vendor-response"
import type { CreateVendor } from "./contract"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: vendors,
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "vendor",
    filters: req.filterableFields,
    ...req.queryConfig,
  })

  res.json({
    vendors: vendors.map(mapVendorConnectionFields),
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: MedusaRequest<CreateVendor>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ vendor: result })
}
