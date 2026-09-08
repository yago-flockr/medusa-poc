import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { setConsignmentStatusStep } from "../shared/steps/set-consignment-status"

export type AcceptConsignmentWorkflowInput = {
  consignmentId: string
}

export const acceptConsignmentWorkflow = createWorkflow(
  "accept-consignment",
  function (input: AcceptConsignmentWorkflowInput) {
    const result = setConsignmentStatusStep({
      consignmentId: input.consignmentId,
      status: "accepted",
    })

    return new WorkflowResponse(result)
  },
)

export default acceptConsignmentWorkflow
