import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { AdminCreateBrand } from "./validators"

type AdminCreateBrandType = z.infer<typeof AdminCreateBrand>

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query")

  const {
    data: brands,
    metadata: { count, take, skip } = {},
  } = await query.graph({
    entity: "brand",
    filters: req.filterableFields,
    ...req.queryConfig,
  })

  res.json({
    brands,
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: MedusaRequest<AdminCreateBrandType>,
  res: MedusaResponse
) => {
  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ brand: result })
}
