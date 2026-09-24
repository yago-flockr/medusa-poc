import { describe, expect, it } from "@jest/globals"
import { buildOrderList } from "../build-order-list"
import type { ConsignmentListRow } from "../../steps/list-consignments"

function row(overrides: Partial<ConsignmentListRow> = {}): ConsignmentListRow {
  return {
    id: "cons_1",
    status: "placed",
    subtotal: 40,
    commission_rate: 0.1,
    commission_total: 4,
    earning_total: 36,
    order: {
      id: "order_1",
      display_id: 1,
      currency_code: "gbp",
      items: [
        {
          id: "item_1",
          title: "Tee",
          quantity: 2,
          total: 40,
          consignment: { id: "cons_1" },
        },
      ],
    },
    ...overrides,
  }
}

describe("buildOrderList", () => {
  it("maps a consignment with its own items into a vendor order", () => {
    const result = buildOrderList([row()])

    expect(result).toEqual([
      {
        id: "cons_1",
        display_id: 1,
        consignment_status: "placed",
        total: 40,
        currency_code: "gbp",
        earnings: {
          subtotal: 40,
          commission_rate: 0.1,
          commission_total: 4,
          earning_total: 36,
        },
        items: [{ id: "item_1", title: "Tee", quantity: 2 }],
      },
    ])
  })

  it("skips a consignment with no order", () => {
    expect(buildOrderList([row({ order: null })])).toEqual([])
  })

  it("only includes items belonging to this consignment, not sibling vendors' items on the same order", () => {
    const result = buildOrderList([
      row({
        order: {
          id: "order_1",
          display_id: 1,
          currency_code: "gbp",
          items: [
            {
              id: "item_1",
              title: "Tee",
              quantity: 2,
              total: 40,
              consignment: { id: "cons_1" },
            },
            {
              id: "item_2",
              title: "Other vendor's item",
              quantity: 1,
              total: 15,
              consignment: { id: "cons_other" },
            },
          ],
        },
      }),
    ])

    expect(result[0].items).toHaveLength(1)
    expect(result[0].total).toBe(40)
  })

  it("sums total across multiple of this consignment's items", () => {
    const result = buildOrderList([
      row({
        order: {
          id: "order_1",
          display_id: 1,
          currency_code: "gbp",
          items: [
            {
              id: "item_1",
              title: "Tee",
              quantity: 2,
              total: 40,
              consignment: { id: "cons_1" },
            },
            {
              id: "item_2",
              title: "Cap",
              quantity: 1,
              total: 15,
              consignment: { id: "cons_1" },
            },
          ],
        },
      }),
    ])

    expect(result[0].total).toBe(55)
  })

  it("treats a missing order.items as no items", () => {
    const result = buildOrderList([
      row({
        order: {
          id: "order_1",
          display_id: 1,
          currency_code: "gbp",
          items: null,
        },
      }),
    ])

    expect(result[0].items).toEqual([])
    expect(result[0].total).toBe(0)
  })

  it("returns an empty array for no consignments", () => {
    expect(buildOrderList([])).toEqual([])
  })
})
