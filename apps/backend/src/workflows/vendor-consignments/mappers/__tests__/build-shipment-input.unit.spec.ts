import { describe, expect, it } from "@jest/globals"
import { buildShipmentInput } from "../build-shipment-input"

describe("buildShipmentInput", () => {
  it("builds one label from the tracking info", () => {
    const result = buildShipmentInput({
      orderId: "order_1",
      fulfillmentId: "ful_1",
      items: [{ id: "item_1", quantity: 1 }],
      trackingNumber: "TRACK123",
    })

    expect(result).toEqual({
      order_id: "order_1",
      fulfillment_id: "ful_1",
      items: [{ id: "item_1", quantity: 1 }],
      labels: [
        { tracking_number: "TRACK123", tracking_url: "", label_url: "" },
      ],
    })
  })

  it("passes through a tracking url when given", () => {
    const result = buildShipmentInput({
      orderId: "order_1",
      fulfillmentId: "ful_1",
      items: [],
      trackingNumber: "TRACK123",
      trackingUrl: "https://track.example.com/TRACK123",
    })

    expect(result.labels[0].tracking_url).toBe(
      "https://track.example.com/TRACK123",
    )
  })
})
