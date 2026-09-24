import { buildConsignmentEarnings } from "../build-consignment-earnings"

describe("buildConsignmentEarnings", () => {
  it("sums unit price by quantity across items", () => {
    const earnings = buildConsignmentEarnings(
      [
        { unit_price: 25, quantity: 2 },
        { unit_price: 10.5, quantity: 1 },
      ],
      0,
    )

    expect(earnings.subtotal).toBe(60.5)
  })

  it("splits the subtotal into commission and earning", () => {
    const earnings = buildConsignmentEarnings(
      [{ unit_price: 100, quantity: 1 }],
      0.1,
    )

    expect(earnings).toEqual({
      subtotal: 100,
      commission_rate: 0.1,
      commission_total: 10,
      earning_total: 90,
    })
  })

  it("always reconciles, even when the rate does not divide cleanly", () => {
    const earnings = buildConsignmentEarnings(
      [{ unit_price: 33.33, quantity: 1 }],
      0.155,
    )

    expect(earnings.commission_total + earnings.earning_total).toBe(
      earnings.subtotal,
    )
  })

  it("treats a missing price or quantity as nothing sold", () => {
    const earnings = buildConsignmentEarnings(
      [
        { unit_price: null, quantity: 3 },
        { unit_price: 10, quantity: null },
        {},
      ],
      0.2,
    )

    expect(earnings).toEqual({
      subtotal: 0,
      commission_rate: 0.2,
      commission_total: 0,
      earning_total: 0,
    })
  })

  it("records nothing for a vendor with no items", () => {
    expect(buildConsignmentEarnings([], 0.3).subtotal).toBe(0)
  })
})
