import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ResolveVendorCartItemsStepInput = {
  cartId: string
}

export type VendorCartItem = {
  quantity: number
  variant: {
    manage_inventory: boolean
    allow_backorder: boolean
    inventory_items:
      | ({
          inventory: {
            requires_shipping: boolean
            location_levels:
              | ({ location_id: string; available_quantity: number } | null)[]
              | null
          } | null
        } | null)[]
      | null
  } | null
}

export const resolveVendorCartItemsStep = createStep(
  "resolve-vendor-cart-items",
  async ({ cartId }: ResolveVendorCartItemsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [cart],
    } = await graph(query, {
      entity: "cart",
      fields: [
        "id",
        "items.quantity",
        "items.product_id",
        "items.variant.manage_inventory",
        "items.variant.allow_backorder",
        "items.variant.inventory_items.inventory.requires_shipping",
        "items.variant.inventory_items.inventory.location_levels.location_id",
        "items.variant.inventory_items.inventory.location_levels.available_quantity",
      ],
      filters: { id: cartId },
    })

    const items = cart?.items ?? []
    const productIds = [
      ...new Set(
        items
          .map((item) => item?.product_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    const { data: products } = await graph(query, {
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id: productIds },
    })
    const vendorIdByProductId = new Map(
      products
        .filter((product) => product.vendor?.id)
        .map((product) => [product.id, product.vendor!.id]),
    )

    const itemsByVendorId: Record<string, VendorCartItem[]> = {}

    for (const item of items) {
      const vendorId = item?.product_id
        ? vendorIdByProductId.get(item.product_id)
        : undefined

      if (!item || !vendorId) {
        continue
      }

      itemsByVendorId[vendorId] = [
        ...(itemsByVendorId[vendorId] ?? []),
        item as VendorCartItem,
      ]
    }

    return new StepResponse(itemsByVendorId)
  },
)
