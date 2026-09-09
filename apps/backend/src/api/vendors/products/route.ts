import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  getVendorsProductsResponseSchema,
  postVendorsProductsResponseSchema,
  type PostVendorsProductsInput,
} from "@dtc/api-contracts/vendor/products"
import { parseListQuery } from "../../../lib/list-query"
import { listVendorProductsWorkflow } from "../../../workflows/vendor-products/list-vendor-products"
import { createVendorProductWorkflow } from "../../../workflows/vendor-products/create-vendor-product"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { limit, offset } = parseListQuery(req.query)

  const { result } = await listVendorProductsWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, limit, offset },
  })

  res.json(getVendorsProductsResponseSchema.parse(result))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsProductsInput>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })

  res.json(postVendorsProductsResponseSchema.parse({ product: result }))
}
