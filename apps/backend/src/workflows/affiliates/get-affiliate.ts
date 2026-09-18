import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildAffiliate } from "./mappers/build-affiliate"
import {
  getAffiliateStep,
  type GetAffiliateStepInput,
} from "./steps/get-affiliate"

export type GetAffiliateWorkflowInput = GetAffiliateStepInput

export const getAffiliateWorkflow = createWorkflow(
  "get-affiliate",
  function (input: GetAffiliateWorkflowInput) {
    const affiliate = getAffiliateStep(input)

    const response = transform({ affiliate }, (data) =>
      buildAffiliate(data.affiliate),
    )

    return new WorkflowResponse(response)
  },
)
