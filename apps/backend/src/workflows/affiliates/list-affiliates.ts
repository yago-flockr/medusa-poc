import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildAffiliate } from "./mappers/build-affiliate"
import {
  listAffiliatesStep,
  type ListAffiliatesStepInput,
} from "./steps/list-affiliates"

export type ListAffiliatesWorkflowInput = ListAffiliatesStepInput

export const listAffiliatesWorkflow = createWorkflow(
  "list-affiliates",
  function (input: ListAffiliatesWorkflowInput) {
    const result = listAffiliatesStep(input)

    const response = transform({ result }, (data) => ({
      affiliates: data.result.affiliates.map(buildAffiliate),
      count: data.result.count,
      limit: data.result.limit,
      offset: data.result.offset,
    }))

    return new WorkflowResponse(response)
  },
)
