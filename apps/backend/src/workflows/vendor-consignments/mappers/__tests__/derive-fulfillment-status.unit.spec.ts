import { describe, expect, it } from "@jest/globals"
import { deriveFulfillmentStatus } from "../derive-fulfillment-status"

function item(
  overrides: Partial<
    Parameters<typeof deriveFulfillmentStatus>[0][number]
  > = {},
) {
  return {
    quantity: 2,
    fulfilled_quantity: 0,
    shipped_quantity: 0,
    delivered_quantity: 0,
    ...overrides,
  }
}

describe("deriveFulfillmentStatus", () => {
  it("returns not_fulfilled with no items", () => {
    expect(deriveFulfillmentStatus([])).toBe("not_fulfilled")
  })

  it("returns not_fulfilled when nothing is fulfilled yet", () => {
    expect(deriveFulfillmentStatus([item()])).toBe("not_fulfilled")
  })

  it("returns partially_fulfilled when some but not all quantity is fulfilled", () => {
    expect(deriveFulfillmentStatus([item({ fulfilled_quantity: 1 })])).toBe(
      "partially_fulfilled",
    )
  })

  it("returns fulfilled when all quantity is fulfilled but not shipped", () => {
    expect(deriveFulfillmentStatus([item({ fulfilled_quantity: 2 })])).toBe(
      "fulfilled",
    )
  })

  it("returns partially_shipped, then shipped, as shipped quantity grows", () => {
    expect(
      deriveFulfillmentStatus([
        item({ fulfilled_quantity: 2, shipped_quantity: 1 }),
      ]),
    ).toBe("partially_shipped")
    expect(
      deriveFulfillmentStatus([
        item({ fulfilled_quantity: 2, shipped_quantity: 2 }),
      ]),
    ).toBe("shipped")
  })

  it("returns partially_delivered, then delivered, as delivered quantity grows", () => {
    expect(
      deriveFulfillmentStatus([
        item({
          fulfilled_quantity: 2,
          shipped_quantity: 2,
          delivered_quantity: 1,
        }),
      ]),
    ).toBe("partially_delivered")
    expect(
      deriveFulfillmentStatus([
        item({
          fulfilled_quantity: 2,
          shipped_quantity: 2,
          delivered_quantity: 2,
        }),
      ]),
    ).toBe("delivered")
  })

  it("sums across multiple items before deriving status", () => {
    const items = [
      item({ quantity: 1, delivered_quantity: 1 }),
      item({ quantity: 1, delivered_quantity: 0 }),
    ]
    expect(deriveFulfillmentStatus(items)).toBe("partially_delivered")
  })
})
