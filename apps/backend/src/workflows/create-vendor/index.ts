import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createVendorStep,
  type CreateVendorStepInput,
} from "./steps/create-vendor"

export type CreateVendorWorkflowInput = CreateVendorStepInput

export const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const vendor = createVendorStep(input)

    return new WorkflowResponse(vendor)
  },
)
