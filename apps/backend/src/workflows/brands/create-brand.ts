import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createBrandStep,
  type CreateBrandStepInput,
} from "./steps/create-brand"
import { buildBrand } from "./mappers/build-brand"

export type CreateBrandWorkflowInput = CreateBrandStepInput

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  function (input: CreateBrandWorkflowInput) {
    const brand = createBrandStep(input)
    const response = transform({ brand }, (data) => buildBrand(data.brand))

    return new WorkflowResponse(response)
  },
)
