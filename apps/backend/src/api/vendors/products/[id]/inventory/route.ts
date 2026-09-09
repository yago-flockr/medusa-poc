import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  getVendorsProductsByIdInventoryResponseSchema,
  type PostVendorsProductsByIdInventoryInput,
} from "@dtc/api-contracts/vendor/product-inventory"
import { getVendorProductInventoryWorkflow } from "../../../../../workflows/vendor-products/get-vendor-product-inventory"
import { setVendorInventoryLevelWorkflow } from "../../../../../workflows/vendor-products/set-vendor-inventory-level"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id: productId } = req.params

  const { result } = await getVendorProductInventoryWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id, productId },
  })

  res.json(getVendorsProductsByIdInventoryResponseSchema.parse(result))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsProductsByIdInventoryInput>,
  res: MedusaResponse,
) => {
  const { id: productId } = req.params
  const { variant_id, location_id, quantity } = req.validatedBody

  const { result } = await setVendorInventoryLevelWorkflow(req.scope).run({
    input: {
      actorId: req.auth_context.actor_id,
      productId,
      variantId: variant_id,
      locationId: location_id,
      quantity,
    },
  })

  res.json(getVendorsProductsByIdInventoryResponseSchema.parse(result))
}
