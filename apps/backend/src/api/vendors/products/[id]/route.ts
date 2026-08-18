import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { assertOwnedVendorProduct } from "../assert-owned-product"
import type { UpdateVendorProduct } from "../contract"

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdateVendorProduct>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, id, vendorUser.vendor_id)

  const { result } = await updateProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          id,
          ...req.validatedBody,
        },
      ],
    },
  })

  res.json({ product: result[0] })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, id, vendorUser.vendor_id)

  await deleteProductsWorkflow(req.scope).run({
    input: { ids: [id] },
  })

  res.status(200).json({ id, deleted: true })
}
