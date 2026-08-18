import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateBrandStep,
  type UpdateBrandStepInput,
} from "./steps/update-brand"

export type UpdateBrandWorkflowInput = UpdateBrandStepInput

export const updateBrandWorkflow = createWorkflow(
  "update-brand",
  function (input: UpdateBrandWorkflowInput) {
    const brand = updateBrandStep(input)

    return new WorkflowResponse(brand)
  },
)
