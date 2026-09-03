import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { setVendorOrderConsignmentStatusStep } from "./steps/set-vendor-order-consignment-status"

export type AcceptVendorOrderWorkflowInput = {
  orderId: string
}

export const acceptVendorOrderWorkflow = createWorkflow(
  "accept-vendor-order",
  function (input: AcceptVendorOrderWorkflowInput) {
    const result = setVendorOrderConsignmentStatusStep({
      orderId: input.orderId,
      status: "accepted",
    })

    return new WorkflowResponse(result)
  },
)

export default acceptVendorOrderWorkflow
