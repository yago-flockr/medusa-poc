import { describe, expect, it } from "@jest/globals"
import { buildAffiliateProductSales } from "../build-affiliate-product-sales"

const item = (
  productId: string,
  quantity: number,
  unitPrice: number,
  returned = 0,
) => ({
  product_id: productId,
  product_title: productId.toUpperCase(),
  product_handle: productId,
  quantity,
  unit_price: unitPrice,
  detail: { return_received_quantity: returned },
})

describe("buildAffiliateProductSales", () => {
  it("sums units and revenue for one product across orders", () => {
    const result = buildAffiliateProductSales([
      { id: "order_1", items: [item("dress", 2, 900)] },
      { id: "order_2", items: [item("dress", 1, 900)] },
    ])
    expect(result).toEqual([
      {
        product_id: "dress",
        product_title: "DRESS",
        product_handle: "dress",
        units_sold: 3,
        units_returned: 0,
        revenue: 2700,
        orders: 2,
      },
    ])
  })

  it("ranks the best seller first", () => {
    const result = buildAffiliateProductSales([
      { id: "order_1", items: [item("dress", 1, 900), item("hat", 5, 100)] },
    ])
    expect(result.map((sales) => sales.product_id)).toEqual(["hat", "dress"])
  })

  it("counts an order once per product even with several lines", () => {
    const result = buildAffiliateProductSales([
      { id: "order_1", items: [item("dress", 1, 900), item("dress", 2, 900)] },
    ])
    expect(result[0].units_sold).toBe(3)
    expect(result[0].orders).toBe(1)
  })

  it("reports returned units without netting them off", () => {
    const result = buildAffiliateProductSales([
      { id: "order_1", items: [item("dress", 3, 900, 1)] },
    ])
    expect(result[0]).toMatchObject({ units_sold: 3, units_returned: 1 })
  })

  it("skips orders and items with nothing usable", () => {
    const result = buildAffiliateProductSales([
      null,
      { id: null, items: [item("dress", 1, 900)] },
      { id: "order_1", items: [null, { product_id: null }] },
    ])
    expect(result).toEqual([])
  })

  it("returns an empty list when the affiliate has referred nothing", () => {
    expect(buildAffiliateProductSales([])).toEqual([])
  })
})
