import { describe, expect, it } from "@jest/globals"
import { buildReferralEarnings } from "../build-referral-earnings"

describe("buildReferralEarnings", () => {
  it("earns the affiliate a share of everything the order sold", () => {
    expect(
      buildReferralEarnings(
        [
          { unit_price: 25, quantity: 2 },
          { unit_price: 40, quantity: 1 },
        ],
        0.1,
      ),
    ).toEqual({ subtotal: 90, commission_total: 9 })
  })

  it("rounds the commission to whole cents", () => {
    expect(
      buildReferralEarnings([{ unit_price: 33.33, quantity: 1 }], 0.155),
    ).toEqual({ subtotal: 33.33, commission_total: 5.17 })
  })

  it("earns nothing on an order with no priced items", () => {
    expect(buildReferralEarnings([], 0.5)).toEqual({
      subtotal: 0,
      commission_total: 0,
    })
  })
})
