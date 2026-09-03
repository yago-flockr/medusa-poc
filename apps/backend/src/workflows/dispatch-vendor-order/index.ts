import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from "@medusajs/medusa/core-flows"
import { setVendorOrderConsignmentStatusStep } from "../accept-vendor-order/steps/set-vendor-order-consignment-status"

export type DispatchVendorOrderWorkflowInput = {
  orderId: string
  items: { id: string; quantity: number }[]
  trackingNumber: string
  trackingUrl?: string
}

export const dispatchVendorOrderWorkflow = createWorkflow(
  "dispatch-vendor-order",
  function (input: DispatchVendorOrderWorkflowInput) {
    const fulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: {
        order_id: input.orderId,
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

    const result = setVendorOrderConsignmentStatusStep({
      orderId: input.orderId,
      status: "dispatched",
    })

    return new WorkflowResponse(result)
  },
)

export default dispatchVendorOrderWorkflow
