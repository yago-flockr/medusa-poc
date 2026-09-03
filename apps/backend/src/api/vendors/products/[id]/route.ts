import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteProductsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  getVendorsProductsByIdResponseSchema,
  type PostVendorsProductsByIdInput,
} from "@dtc/api-contracts/vendor/products"
import { resolveStorePrerequisites } from "../../../../lib/resolve-store-prerequisites"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { assertOwnedVendorProduct } from "../assert-owned-product"
import { assertPublishableVendorProduct } from "../assert-publishable-product"
import { assertEditableVendorProduct } from "../assert-editable-product"
import { buildVendorProductDetail } from "../build-product-detail"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, id, vendorUser.vendor_id)

  const product = await buildVendorProductDetail(query, id)

  res.json(getVendorsProductsByIdResponseSchema.parse({ product }))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsProductsByIdInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { variants, ...productFields } = req.validatedBody

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, id, vendorUser.vendor_id)

  const {
    data: [existingProduct],
  } = await query.graph({
    entity: "product",
    fields: ["id", "external_id"],
    filters: { id },
  })

  assertEditableVendorProduct(existingProduct?.external_id ?? null, req.validatedBody)

  if (variants?.length) {
    const { storeCurrencies } = await resolveStorePrerequisites(query)

    await updateProductVariantsWorkflow(req.scope).run({
      input: {
        product_variants: variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          weight: variant.weight,
          prices: variant.price
            ? storeCurrencies.map((currency) => ({
                amount: variant.price as number,
                currency_code: currency,
              }))
            : undefined,
        })),
      },
    })
  }

  if (productFields.status === "published") {
    await assertPublishableVendorProduct(query, id)
  }

  if (Object.keys(productFields).length > 0) {
    await updateProductsWorkflow(req.scope).run({
      input: {
        products: [{ id, ...productFields }],
      },
    })
  }

  const product = await buildVendorProductDetail(query, id)

  res.json(getVendorsProductsByIdResponseSchema.parse({ product }))
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
