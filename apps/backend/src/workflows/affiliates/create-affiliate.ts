import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildAffiliate } from "./mappers/build-affiliate"
import {
  createAffiliateStep,
  type CreateAffiliateStepInput,
} from "./steps/create-affiliate"

export type CreateAffiliateWorkflowInput = CreateAffiliateStepInput

export const createAffiliateWorkflow = createWorkflow(
  "create-affiliate",
  function (input: CreateAffiliateWorkflowInput) {
    const affiliate = createAffiliateStep(input)

    const response = transform({ affiliate }, (data) =>
      buildAffiliate(data.affiliate),
    )

    return new WorkflowResponse(response)
  },
)
