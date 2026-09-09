import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { listBrandsStep, type ListBrandsStepInput } from "./steps/list-brands"
import { buildBrandList } from "./mappers/build-brand-list"

export type ListBrandsWorkflowInput = ListBrandsStepInput

export const listBrandsWorkflow = createWorkflow(
  "list-brands",
  function (input: ListBrandsWorkflowInput) {
    const result = listBrandsStep(input)
    const response = transform({ result }, (data) =>
      buildBrandList(data.result),
    )

    return new WorkflowResponse(response)
  },
)
