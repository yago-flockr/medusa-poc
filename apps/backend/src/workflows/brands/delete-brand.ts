import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteBrandStep,
  type DeleteBrandStepInput,
} from "./steps/delete-brand"

export type DeleteBrandWorkflowInput = DeleteBrandStepInput

export const deleteBrandWorkflow = createWorkflow(
  "delete-brand",
  function (input: DeleteBrandWorkflowInput) {
    const result = deleteBrandStep(input)

    return new WorkflowResponse(result)
  },
)
