import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  regenerateAffiliatePasswordStep,
  type RegenerateAffiliatePasswordStepInput,
} from "./steps/regenerate-affiliate-password"

export type RegenerateAffiliatePasswordWorkflowInput =
  RegenerateAffiliatePasswordStepInput

export const regenerateAffiliatePasswordWorkflow = createWorkflow(
  "regenerate-affiliate-password",
  function (input: RegenerateAffiliatePasswordWorkflowInput) {
    const result = regenerateAffiliatePasswordStep(input)

    return new WorkflowResponse(result)
  },
)
