import { describe, expect, it } from "@jest/globals"
import { buildConsignmentDetail } from "../build-consignment-detail"
import type { OrderDetail } from "../../steps/get-consignment-order"

function order(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: "order_1",
    display_id: 5,
    status: "pending",
    currency_code: "gbp",
    items: [
      {
        id: "item_1",
        title: "Tee",
        variant_title: "M",
        variant_sku: "TEE-M",
        quantity: 2,
        unit_price: 20,
        total: 40,
        consignment: { id: "cons_1" },
        detail: {
          fulfilled_quantity: 0,
          shipped_quantity: 0,
          delivered_quantity: 0,
        },
      },
    ],
    shipping_address: null,
    ...overrides,
  }
}

describe("buildConsignmentDetail", () => {
  it("builds the response from the consignment's own items only", () => {
    const result = buildConsignmentDetail({
      consignmentId: "cons_1",
      consignmentStatus: "placed",
      order: order(),
    })

    expect(result).toEqual({
      id: "cons_1",
      display_id: 5,
      status: "pending",
      fulfillment_status: "not_fulfilled",
      consignment_status: "placed",
      total: 40,
      currency_code: "gbp",
      items: [
        {
          id: "item_1",
          title: "Tee",
          variant_title: "M",
          variant_sku: "TEE-M",
          quantity: 2,
          unit_price: 20,
        },
      ],
      shipping_address: null,
    })
  })

  it("excludes another vendor's items on the same order", () => {
    const result = buildConsignmentDetail({
      consignmentId: "cons_1",
      consignmentStatus: "placed",
      order: order({
        items: [
          ...order().items!,
          {
            id: "item_2",
            title: "Other",
            variant_title: null,
            variant_sku: null,
            quantity: 1,
            unit_price: 10,
            total: 10,
            consignment: { id: "cons_other" },
            detail: null,
          },
        ],
      }),
    })

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(40)
  })

  it("treats a missing item detail as zero fulfillment", () => {
    const result = buildConsignmentDetail({
      consignmentId: "cons_1",
      consignmentStatus: "placed",
      order: order({
        items: [{ ...order().items![0], detail: null }],
      }),
    })

    expect(result.fulfillment_status).toBe("not_fulfilled")
  })

  it("passes through the shipping address when present", () => {
    const address = {
      first_name: "Jane",
      last_name: "Doe",
      address_1: "1 Test St",
      address_2: null,
      city: "London",
      province: null,
      postal_code: "E1 6AN",
      country_code: "gb",
      phone: null,
    }

    const result = buildConsignmentDetail({
      consignmentId: "cons_1",
      consignmentStatus: "placed",
      order: order({ shipping_address: address }),
    })

    expect(result.shipping_address).toEqual(address)
  })
})
