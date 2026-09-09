import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listBrandsWorkflow } from "../../../workflows/brands/list-brands"
import { createBrandWorkflow } from "../../../workflows/brands/create-brand"
import {
  brandListResponseSchema,
  brandResponseSchema,
  type CreateBrand,
} from "@dtc/api-contracts/admin/brands"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listBrandsWorkflow(req.scope).run({
    input: { filters: req.filterableFields, queryConfig: req.queryConfig },
  })

  res.json(brandListResponseSchema.parse(result))
}

export const POST = async (
  req: MedusaRequest<CreateBrand>,
  res: MedusaResponse,
) => {
  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json(brandResponseSchema.parse({ brand: result }))
}
