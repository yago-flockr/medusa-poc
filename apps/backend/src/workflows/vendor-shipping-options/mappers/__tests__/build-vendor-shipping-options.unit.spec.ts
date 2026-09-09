import { describe, expect, it } from "@jest/globals"
import { buildVendorShippingOptions } from "../build-vendor-shipping-options"
import type { VendorCartItem } from "../../steps/resolve-vendor-cart-items"

function optionAt(
  id: string,
  shippingProfileId: string,
  locationId: string,
  overrides: { name?: string; amount?: number } = {},
) {
  return {
    id,
    shipping_profile_id: shippingProfileId,
    name: overrides.name ?? "Free Shipping",
    amount: overrides.amount ?? 0,
    price_type: "flat",
    type: { code: "standard" },
    service_zone: { fulfillment_set: { location: { id: locationId } } },
  }
}

function itemNeeding(
  quantity: number,
  availableAtLocation: Record<string, number>,
): VendorCartItem {
  return {
    quantity,
    variant: {
      manage_inventory: true,
      allow_backorder: false,
      inventory_items: [
        {
          inventory: {
            requires_shipping: true,
            location_levels: Object.entries(availableAtLocation).map(
              ([location_id, available_quantity]) => ({
                location_id,
                available_quantity,
              }),
            ),
          },
        },
      ],
    },
  }
}

describe("buildVendorShippingOptions", () => {
  it("collapses identical options across a vendor's locations into one", () => {
    const result = buildVendorShippingOptions(
      [
        optionAt("so_1", "sp_1", "loc_a"),
        optionAt("so_2", "sp_1", "loc_b"),
      ],
      { sp_1: { id: "vendor_1", name: "Acme" } },
      { vendor_1: [itemNeeding(1, { loc_a: 5 })] },
    )

    expect(result).toHaveLength(1)
  })

  it("covers a cart split across a vendor's locations by different products", () => {
    // Regression: product A only stocked at location A, product B only at
    // location B, same vendor — both are fulfillable via separate parcels.
    const result = buildVendorShippingOptions(
      [
        optionAt("so_1", "sp_1", "loc_a"),
        optionAt("so_2", "sp_1", "loc_b"),
      ],
      { sp_1: { id: "vendor_1", name: "Acme" } },
      {
        vendor_1: [
          itemNeeding(1, { loc_a: 1, loc_b: 0 }),
          itemNeeding(1, { loc_a: 0, loc_b: 1 }),
        ],
      },
    )

    expect(result).toHaveLength(1)
  })

  it("drops a group when no location in it covers every item", () => {
    const result = buildVendorShippingOptions(
      [optionAt("so_1", "sp_1", "loc_a")],
      { sp_1: { id: "vendor_1", name: "Acme" } },
      { vendor_1: [itemNeeding(1, { loc_a: 0 })] },
    )

    expect(result).toEqual([])
  })

  it("keeps distinctly named/priced options separate, each checked against its own location", () => {
    const result = buildVendorShippingOptions(
      [
        optionAt("so_1", "sp_1", "loc_a", { name: "Standard", amount: 0 }),
        optionAt("so_2", "sp_1", "loc_b", { name: "Express", amount: 500 }),
      ],
      { sp_1: { id: "vendor_1", name: "Acme" } },
      { vendor_1: [itemNeeding(1, { loc_a: 1, loc_b: 0 })] },
    )

    expect(result.map((o) => o.id)).toEqual(["so_1"])
  })

  it("drops an option for a vendor with no items in the cart", () => {
    const result = buildVendorShippingOptions(
      [optionAt("so_1", "sp_1", "loc_a")],
      { sp_1: { id: "vendor_1", name: "Acme" } },
      {},
    )

    expect(result).toEqual([])
  })

  it("keeps a vendor-less option untouched", () => {
    const result = buildVendorShippingOptions(
      [
        {
          id: "so_1",
          shipping_profile_id: null,
          name: "Free Shipping",
          amount: 0,
          price_type: "flat",
          type: { code: "standard" },
          service_zone: null,
        },
      ],
      {},
      {},
    )

    expect(result.map((o) => o.id)).toEqual(["so_1"])
  })
})
