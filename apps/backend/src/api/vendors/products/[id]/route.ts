import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteVendorsProductsByIdResponseSchema,
  getVendorsProductsByIdResponseSchema,
  type PostVendorsProductsByIdInput,
} from "@dtc/api-contracts/vendor/products"
import { getVendorProductWorkflow } from "../../../../workflows/vendor-products/get-vendor-product"
import { updateVendorProductWorkflow } from "../../../../workflows/vendor-products/update-vendor-product"
import { deleteVendorProductWorkflow } from "../../../../workflows/vendor-products/delete-vendor-product"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await getVendorProductWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, productId: id },
  })

  res.json(getVendorsProductsByIdResponseSchema.parse({ product: result }))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsProductsByIdInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await updateVendorProductWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      productId: id,
      ...req.validatedBody,
    },
  })

  res.json(getVendorsProductsByIdResponseSchema.parse({ product: result }))
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await deleteVendorProductWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, productId: id },
  })

  res.status(200).json(deleteVendorsProductsByIdResponseSchema.parse(result))
}
