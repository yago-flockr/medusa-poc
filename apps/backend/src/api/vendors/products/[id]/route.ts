import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  deleteProductsWorkflow,
  updateInventoryItemsWorkflow,
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
          prices: variant.price
            ? storeCurrencies.map((currency) => ({
                amount: variant.price as number,
                currency_code: currency,
              }))
            : undefined,
        })),
      },
    })

    // updateProductVariantsWorkflow only ever touches product_variant.sku —
    // confirmed by direct inspection, it has no code path that reaches the
    // variant's own linked InventoryItem row at all. A variant created with
    // no SKU (every Shopify-synced variant, since real Shopify data commonly
    // has null SKUs) already has an InventoryItem with sku: null from
    // creation; editing the SKU in here would otherwise leave that mismatch
    // permanently, and Admin's own Inventory list reads inventory_item.sku,
    // not product_variant.sku, so the vendor's real SKU would never surface
    // there even though it's correct everywhere else (storefront, order
    // lines, this same edit form). Sync it explicitly, only for variants
    // whose sku was actually part of this request.
    const variantsWithSku = variants.filter(
      (variant): variant is typeof variant & { sku: string } =>
        variant.sku !== undefined,
    )

    if (variantsWithSku.length) {
      const { data: variantsWithInventory } = await query.graph({
        entity: "product_variant",
        fields: ["id", "inventory_items.inventory.id"],
        filters: { id: variantsWithSku.map((variant) => variant.id) },
      })

      const inventoryUpdates = variantsWithInventory.flatMap((variant) => {
        const matchingInput = variantsWithSku.find((v) => v.id === variant.id)
        const inventoryItemId = variant.inventory_items?.[0]?.inventory?.id

        if (!matchingInput || !inventoryItemId) {
          return []
        }

        return [{ id: inventoryItemId, sku: matchingInput.sku }]
      })

      if (inventoryUpdates.length) {
        await updateInventoryItemsWorkflow(req.scope).run({
          input: { updates: inventoryUpdates },
        })
      }
    }
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
