import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getAffiliateMeStep } from "./steps/get-affiliate-me"
import {
  updateAffiliateMeStep,
  type UpdateAffiliateMeStepInput,
} from "./steps/update-affiliate-me"

export type UpdateAffiliateMeWorkflowInput = UpdateAffiliateMeStepInput

export const updateAffiliateMeWorkflow = createWorkflow(
  "update-affiliate-me",
  function (input: UpdateAffiliateMeWorkflowInput) {
    updateAffiliateMeStep(input)

    const affiliate = getAffiliateMeStep({ actorId: input.actorId })

    const response = transform({ affiliate }, (data) => ({
      affiliate: data.affiliate,
    }))

    return new WorkflowResponse(response)
  },
)
