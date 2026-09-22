import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  getAffiliateMeStep,
  type GetAffiliateMeStepInput,
} from "./steps/get-affiliate-me"

export type GetAffiliateMeWorkflowInput = GetAffiliateMeStepInput

export const getAffiliateMeWorkflow = createWorkflow(
  "get-affiliate-me",
  function (input: GetAffiliateMeWorkflowInput) {
    const affiliate = getAffiliateMeStep(input)

    const response = transform({ affiliate }, (data) => ({
      affiliate: data.affiliate,
    }))

    return new WorkflowResponse(response)
  },
)
