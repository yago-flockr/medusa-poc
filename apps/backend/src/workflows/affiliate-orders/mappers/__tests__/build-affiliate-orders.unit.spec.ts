import { describe, expect, it } from "@jest/globals"
import { buildAffiliateOrders } from "../build-affiliate-orders"

describe("buildAffiliateOrders", () => {
  it("lists each referred order with its units and commission", () => {
    expect(
      buildAffiliateOrders([
        {
          id: "ref_1",
          currency_code: "gbp",
          commission_total: 10.004,
          order: { display_id: 1, items: [{ quantity: 2 }, { quantity: 1 }] },
        },
      ]),
    ).toEqual([
      {
        id: "ref_1",
        display_id: 1,
        currency_code: "gbp",
        units: 3,
        commission_total: 10,
      },
    ])
  })

  it("skips a referral whose order never materialised", () => {
    expect(
      buildAffiliateOrders([
        { id: "ref_x", currency_code: "gbp", commission_total: 9, order: null },
      ]),
    ).toEqual([])
  })
})
