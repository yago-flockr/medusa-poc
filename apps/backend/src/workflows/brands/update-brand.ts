import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateBrandStep,
  type UpdateBrandStepInput,
} from "./steps/update-brand"
import { buildBrand } from "./mappers/build-brand"

export type UpdateBrandWorkflowInput = UpdateBrandStepInput

export const updateBrandWorkflow = createWorkflow(
  "update-brand",
  function (input: UpdateBrandWorkflowInput) {
    const brand = updateBrandStep(input)
    const response = transform({ brand }, (data) => buildBrand(data.brand))

    return new WorkflowResponse(response)
  },
)
