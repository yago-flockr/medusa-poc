import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { toIsoString, toIsoStringOrNull } from "../../../lib/normalize-timestamps"
import {
  brandListResponseSchema,
  brandResponseSchema,
  type CreateBrand,
} from "@dtc/api-contracts/admin/brands"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: brands, metadata: { count, take, skip } = {} } =
    await query.graph({
      entity: "brand",
      filters: req.filterableFields,
      ...req.queryConfig,
    })

  res.json(
    brandListResponseSchema.parse({
      brands: brands.map((brand) => ({
        ...brand,
        created_at: toIsoString(brand.created_at),
        updated_at: toIsoString(brand.updated_at),
        deleted_at: toIsoStringOrNull(brand.deleted_at),
      })),
      count,
      limit: take,
      offset: skip,
    }),
  )
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
