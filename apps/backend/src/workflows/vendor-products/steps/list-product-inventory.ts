import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ListProductInventoryStepInput = {
  productId: string
  vendorId: string
}

export const listProductInventoryStep = createStep(
  "list-product-inventory",
  async (
    { productId, vendorId }: ListProductInventoryStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const [
      {
        data: [product],
      },
      { data: locations },
    ] = await Promise.all([
      graph(query, {
        entity: "product",
        fields: [
          "id",
          "variants.id",
          "variants.title",
          "variants.inventory_items.inventory.id",
        ],
        filters: { id: productId },
      }),
      graph(query, {
        entity: "stock_location",
        fields: ["id", "name"],
        filters: { vendor: { id: vendorId } },
      }),
    ])

    const variants = (product?.variants ?? []).filter(
      (variant): variant is NonNullable<typeof variant> => variant != null,
    )
    const inventoryItemIds = variants
      .map((variant) => variant.inventory_items?.[0]?.inventory?.id)
      .filter((id): id is string => Boolean(id))

    const { data: levels } = inventoryItemIds.length
      ? await graph(query, {
          entity: "inventory_level",
          fields: [
            "inventory_item_id",
            "location_id",
            "stocked_quantity",
            "reserved_quantity",
          ],
          filters: { inventory_item_id: inventoryItemIds },
        })
      : { data: [] }

    return new StepResponse({ variants, levels, locations })
  },
)
