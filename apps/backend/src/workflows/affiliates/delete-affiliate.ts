import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { assertAffiliateHasNoReferralsStep } from "./steps/assert-affiliate-has-no-referrals"
import {
  deleteAffiliateStep,
  type DeleteAffiliateStepInput,
} from "./steps/delete-affiliate"

export type DeleteAffiliateWorkflowInput = DeleteAffiliateStepInput

export const deleteAffiliateWorkflow = createWorkflow(
  "delete-affiliate",
  function (input: DeleteAffiliateWorkflowInput) {
    assertAffiliateHasNoReferralsStep(input)
    const result = deleteAffiliateStep(input)

    return new WorkflowResponse(result)
  },
)
