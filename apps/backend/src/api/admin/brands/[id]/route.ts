import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBrandWorkflow } from "../../../../workflows/brands/get-brand"
import { updateBrandWorkflow } from "../../../../workflows/brands/update-brand"
import { deleteBrandWorkflow } from "../../../../workflows/brands/delete-brand"
import {
  brandDeleteResponseSchema,
  brandResponseSchema,
  type UpdateBrand,
} from "@dtc/api-contracts/admin/brands"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await getBrandWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(brandResponseSchema.parse({ brand: result }))
}

export const POST = async (
  req: MedusaRequest<UpdateBrand>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await updateBrandWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json(brandResponseSchema.parse({ brand: result }))
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteBrandWorkflow(req.scope).run({
    input: { id },
  })

  res.json(
    brandDeleteResponseSchema.parse({
      id,
      object: "brand",
      deleted: true,
    }),
  )
}
