import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { RemoteQueryFunction } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  vendorProductInventoryResponseSchema,
  type SetVendorInventoryLevel,
  type VendorProductInventoryResponse,
} from "@dtc/api-contracts/vendor/product-inventory"
import { setVendorInventoryLevelWorkflow } from "../../../../../workflows/set-vendor-inventory-level"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { assertOwnedVendorProduct } from "../../assert-owned-product"
import { assertOwnedVendorVariant } from "../../assert-owned-variant"
import { assertOwnedVendorStockLocation } from "../../../stock-locations/assert-owned-stock-location"

async function buildProductInventoryResponse(
  query: Omit<RemoteQueryFunction, symbol>,
  productId: string,
  vendorId: string,
): Promise<VendorProductInventoryResponse> {
  const [{ data: [product] }, { data: locations }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: ["id", "variants.id", "variants.title", "variants.inventory_items.inventory.id"],
      filters: { id: productId },
    }),
    query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
      filters: { vendor: { id: vendorId } },
    }),
  ])

  const variants = product?.variants ?? []
  const inventoryItemIds = variants
    .map((variant) => variant?.inventory_items?.[0]?.inventory?.id)
    .filter((id): id is string => Boolean(id))

  const { data: levels } = inventoryItemIds.length
    ? await query.graph({
        entity: "inventory_level",
        fields: ["inventory_item_id", "location_id", "stocked_quantity"],
        filters: { inventory_item_id: inventoryItemIds },
      })
    : { data: [] }

  return {
    variants: variants
      .filter((variant): variant is NonNullable<typeof variant> => variant != null)
      .map((variant) => {
        const inventoryItemId = variant.inventory_items?.[0]?.inventory?.id ?? null

        return {
          variant_id: variant.id,
          variant_title: variant.title,
          levels: levels
            .filter((level) => level.inventory_item_id === inventoryItemId)
            .map((level) => ({
              location_id: level.location_id,
              quantity: Number(level.stocked_quantity),
            })),
        }
      }),
    locations: locations.map((location) => ({ id: location.id, name: location.name })),
  }
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id: productId } = req.params

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, productId, vendorUser.vendor_id)

  const response = await buildProductInventoryResponse(
    query,
    productId,
    vendorUser.vendor_id,
  )

  res.json(vendorProductInventoryResponseSchema.parse(response))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<SetVendorInventoryLevel>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id: productId } = req.params
  const { variant_id, location_id, quantity } = req.validatedBody

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorProduct(query, productId, vendorUser.vendor_id)
  await assertOwnedVendorVariant(query, variant_id, vendorUser.vendor_id)
  await assertOwnedVendorStockLocation(query, location_id, vendorUser.vendor_id)

  await setVendorInventoryLevelWorkflow(req.scope).run({
    input: { variantId: variant_id, locationId: location_id, quantity },
  })

  const response = await buildProductInventoryResponse(
    query,
    productId,
    vendorUser.vendor_id,
  )

  res.json(vendorProductInventoryResponseSchema.parse(response))
}
