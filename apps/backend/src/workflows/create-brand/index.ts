import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createBrandStep,
  type CreateBrandStepInput,
} from "./steps/create-brand"

export type CreateBrandWorkflowInput = CreateBrandStepInput

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  function (input: CreateBrandWorkflowInput) {
    const brand = createBrandStep(input)

    return new WorkflowResponse(brand)
  },
)
