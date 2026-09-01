import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { updateBrandWorkflow } from "../../../../workflows/update-brand"
import { deleteBrandWorkflow } from "../../../../workflows/delete-brand"
import { toIsoString, toIsoStringOrNull } from "../../../../lib/normalize-timestamps"
import {
  brandDeleteResponseSchema,
  brandResponseSchema,
  type UpdateBrand,
} from "@dtc/api-contracts/admin/brands"

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
      `Brand with id: ${id} was not found`,
    )
  }

  res.json(
    brandResponseSchema.parse({
      brand: {
        ...brand,
        created_at: toIsoString(brand.created_at),
        updated_at: toIsoString(brand.updated_at),
        deleted_at: toIsoStringOrNull(brand.deleted_at),
      },
    }),
  )
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

  res.json(
    brandResponseSchema.parse({
      brand: {
        ...result,
        created_at: toIsoString(result.created_at),
        updated_at: toIsoString(result.updated_at),
        deleted_at: toIsoStringOrNull(result.deleted_at),
      },
    }),
  )
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
