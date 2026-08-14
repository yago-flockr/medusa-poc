import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateBrandWorkflow } from "../../../../workflows/update-brand"
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand"
import type { UpdateBrand } from "../contract"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [brand],
  } = await query.graph({
    entity: "brand",
    filters: { id },
    ...req.queryConfig,
  })

  if (!brand) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Brand with id: ${id} was not found`
    )
  }

  res.json({ brand })
}

export const POST = async (
  req: MedusaRequest<UpdateBrand>,
  res: MedusaResponse
) => {
  const { id } = req.params

  const { result } = await updateBrandWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json({ brand: result })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteBrandWorkflow(req.scope).run({
    input: { id },
  })

  res.json({
    id,
    object: "brand",
    deleted: true,
  })
}
