import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listVendorsWorkflow } from "../../../workflows/vendors/list-vendors"
import { createVendorWorkflow } from "../../../workflows/vendors/create-vendor"
import {
  vendorListResponseSchema,
  vendorResponseSchema,
  type CreateVendor,
} from "@dtc/api-contracts/admin/vendors"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listVendorsWorkflow(req.scope).run({
    input: { filters: req.filterableFields, queryConfig: req.queryConfig },
  })

  res.json(vendorListResponseSchema.parse(result))
}

export const POST = async (
  req: MedusaRequest<CreateVendor>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json(vendorResponseSchema.parse({ vendor: result }))
}
