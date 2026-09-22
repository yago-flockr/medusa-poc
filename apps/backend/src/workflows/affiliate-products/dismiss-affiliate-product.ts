import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  dismissAffiliateProductStep,
  type DismissAffiliateProductStepInput,
} from "./steps/dismiss-affiliate-product"

export type DismissAffiliateProductWorkflowInput =
  DismissAffiliateProductStepInput

export const dismissAffiliateProductWorkflow = createWorkflow(
  "dismiss-affiliate-product",
  function (input: DismissAffiliateProductWorkflowInput) {
    const result = dismissAffiliateProductStep(input)

    return new WorkflowResponse(result)
  },
)
