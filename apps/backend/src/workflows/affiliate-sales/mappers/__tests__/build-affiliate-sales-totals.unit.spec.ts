import { describe, expect, it } from "@jest/globals"
import { buildAffiliateSalesTotals } from "../build-affiliate-sales-totals"

const referral = (subtotal: number, commission: number, quantity: number) => ({
  subtotal,
  commission_total: commission,
  order: { id: `order_${subtotal}_${quantity}`, items: [{ quantity }] },
})

describe("buildAffiliateSalesTotals", () => {
  it("adds up what each referral recorded when its order was placed", () => {
    expect(
      buildAffiliateSalesTotals([referral(100, 10, 1), referral(50, 12.5, 2)]),
    ).toEqual({
      orders: 2,
      units_sold: 3,
      revenue: 150,
      commission_total: 22.5,
    })
  })

  it("ignores a referral whose order never materialised", () => {
    expect(
      buildAffiliateSalesTotals([null, { subtotal: 99, commission_total: 9 }]),
    ).toEqual({ orders: 0, units_sold: 0, revenue: 0, commission_total: 0 })
  })
})
