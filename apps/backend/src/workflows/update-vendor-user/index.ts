import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateVendorUserStep,
  type UpdateVendorUserStepInput,
} from "./steps/update-vendor-user"

export type UpdateVendorUserWorkflowInput = UpdateVendorUserStepInput

export const updateVendorUserWorkflow = createWorkflow(
  "update-vendor-user",
  function (input: UpdateVendorUserWorkflowInput) {
    const vendorUser = updateVendorUserStep(input)

    return new WorkflowResponse(vendorUser)
  },
)
