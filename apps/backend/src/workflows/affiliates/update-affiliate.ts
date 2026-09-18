import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateAffiliateStep,
  type UpdateAffiliateStepInput,
} from "./steps/update-affiliate"

export type UpdateAffiliateWorkflowInput = UpdateAffiliateStepInput

export const updateAffiliateWorkflow = createWorkflow(
  "update-affiliate",
  function (input: UpdateAffiliateWorkflowInput) {
    const affiliate = updateAffiliateStep(input)

    return new WorkflowResponse(affiliate)
  },
)
