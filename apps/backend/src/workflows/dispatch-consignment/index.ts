import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from "@medusajs/medusa/core-flows"
import { setConsignmentStatusStep } from "../shared/steps/set-consignment-status"

export type DispatchConsignmentWorkflowInput = {
  consignmentId: string
  orderId: string
  locationId: string
  shippingOptionId: string
  items: { id: string; quantity: number }[]
  trackingNumber: string
  trackingUrl?: string
}

// Fulfills just this consignment's own items on the one real order — Medusa
// already supports fulfilling a subset of an order's items natively (partial
// fulfillment), so there's no need for a separate order per vendor to get an
// independent per-vendor dispatch.
export const dispatchConsignmentWorkflow = createWorkflow(
  "dispatch-consignment",
  function (input: DispatchConsignmentWorkflowInput) {
    const fulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: {
        order_id: input.orderId,
        location_id: input.locationId,
        shipping_option_id: input.shippingOptionId,
        items: input.items,
      },
    })

    const shipmentInput = transform({ input, fulfillment }, (data) => ({
      order_id: data.input.orderId,
      fulfillment_id: data.fulfillment.id,
      items: data.input.items,
      labels: [
        {
          tracking_number: data.input.trackingNumber,
          tracking_url: data.input.trackingUrl ?? "",
          label_url: "",
        },
      ],
    }))

    createOrderShipmentWorkflow.runAsStep({ input: shipmentInput })

    const result = setConsignmentStatusStep({
      consignmentId: input.consignmentId,
      status: "dispatched",
    })

    return new WorkflowResponse(result)
  },
)

export default dispatchConsignmentWorkflow
