import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateVendorStep,
  type UpdateVendorStepInput,
} from "./steps/update-vendor"

export type UpdateVendorWorkflowInput = UpdateVendorStepInput

export const updateVendorWorkflow = createWorkflow(
  "update-vendor",
  function (input: UpdateVendorWorkflowInput) {
    const vendor = updateVendorStep(input)

    return new WorkflowResponse(vendor)
  },
)
