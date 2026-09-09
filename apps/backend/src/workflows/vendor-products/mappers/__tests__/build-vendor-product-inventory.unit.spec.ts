import { describe, expect, it } from "@jest/globals"
import { buildVendorProductInventory } from "../build-vendor-product-inventory"

describe("buildVendorProductInventory", () => {
  it("groups levels by variant via their inventory item id", () => {
    const result = buildVendorProductInventory(
      [
        {
          id: "v1",
          title: "M",
          inventory_items: [{ inventory: { id: "iitem_1" } }],
        },
      ],
      [
        {
          inventory_item_id: "iitem_1",
          location_id: "loc_1",
          stocked_quantity: "5",
          reserved_quantity: "1",
        },
      ],
      [{ id: "loc_1", name: "Warehouse" }],
    )

    expect(result.variants).toEqual([
      {
        variant_id: "v1",
        variant_title: "M",
        levels: [{ location_id: "loc_1", quantity: 5, reserved_quantity: 1 }],
      },
    ])
    expect(result.locations).toEqual([{ id: "loc_1", name: "Warehouse" }])
  })

  it("returns an empty levels array for a variant with no inventory item", () => {
    const result = buildVendorProductInventory(
      [{ id: "v1", title: "M", inventory_items: [] }],
      [],
      [],
    )

    expect(result.variants[0].levels).toEqual([])
  })
})
