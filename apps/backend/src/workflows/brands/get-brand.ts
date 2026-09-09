import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getBrandStep, type GetBrandStepInput } from "./steps/get-brand"
import { buildBrand } from "./mappers/build-brand"

export type GetBrandWorkflowInput = GetBrandStepInput

export const getBrandWorkflow = createWorkflow(
  "get-brand",
  function (input: GetBrandWorkflowInput) {
    const brand = getBrandStep(input)
    const response = transform({ brand }, (data) => buildBrand(data.brand))

    return new WorkflowResponse(response)
  },
)
