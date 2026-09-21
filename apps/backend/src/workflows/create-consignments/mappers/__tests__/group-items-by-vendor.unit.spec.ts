import { describe, expect, it } from "@jest/globals"
import { groupItemsByVendor } from "../group-items-by-vendor"

const vendorByProduct = new Map([
  ["prod_a", "vendor_1"],
  ["prod_b", "vendor_1"],
  ["prod_c", "vendor_2"],
])

describe("groupItemsByVendor", () => {
  it("returns nothing to route for an empty cart", () => {
    expect(groupItemsByVendor([], vendorByProduct)).toEqual({})
  })

  it("routes every item of a single-vendor cart to that vendor", () => {
    const items = [
      { id: "item_1", product_id: "prod_a" },
      { id: "item_2", product_id: "prod_b" },
    ]

    expect(groupItemsByVendor(items, vendorByProduct)).toEqual({
      vendor_1: items,
    })
  })

  it("splits a multi-vendor cart into one group per vendor", () => {
    const fromVendorOne = { id: "item_1", product_id: "prod_a" }
    const fromVendorTwo = { id: "item_2", product_id: "prod_c" }

    expect(
      groupItemsByVendor([fromVendorOne, fromVendorTwo], vendorByProduct),
    ).toEqual({
      vendor_1: [fromVendorOne],
      vendor_2: [fromVendorTwo],
    })
  })

  it("keeps two lines of the same product together under one vendor", () => {
    const items = [
      { id: "item_1", product_id: "prod_a" },
      { id: "item_2", product_id: "prod_a" },
    ]

    expect(groupItemsByVendor(items, vendorByProduct).vendor_1).toHaveLength(2)
  })

  it("preserves the order items arrived in", () => {
    const items = [
      { id: "item_1", product_id: "prod_a" },
      { id: "item_2", product_id: "prod_b" },
      { id: "item_3", product_id: "prod_a" },
    ]

    expect(
      groupItemsByVendor(items, vendorByProduct).vendor_1.map(
        (item) => item.id,
      ),
    ).toEqual(["item_1", "item_2", "item_3"])
  })

  it("refuses to route an item whose product has no vendor", () => {
    expect(() =>
      groupItemsByVendor(
        [{ id: "item_1", product_id: "prod_unknown" }],
        vendorByProduct,
      ),
    ).toThrow("prod_unknown")
  })

  it("refuses to route an item with no product at all", () => {
    expect(() =>
      groupItemsByVendor([{ id: "item_1", product_id: null }], vendorByProduct),
    ).toThrow("(unknown)")
  })

  it("fails the whole cart rather than silently dropping an unroutable item", () => {
    expect(() =>
      groupItemsByVendor(
        [
          { id: "item_1", product_id: "prod_a" },
          { id: "item_2", product_id: "prod_unknown" },
        ],
        vendorByProduct,
      ),
    ).toThrow()
  })
})
