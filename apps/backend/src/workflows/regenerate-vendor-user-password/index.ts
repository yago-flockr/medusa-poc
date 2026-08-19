import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  regenerateVendorUserPasswordStep,
  type RegenerateVendorUserPasswordStepInput,
} from "./steps/regenerate-vendor-user-password"

export type RegenerateVendorUserPasswordWorkflowInput =
  RegenerateVendorUserPasswordStepInput

export const regenerateVendorUserPasswordWorkflow = createWorkflow(
  "regenerate-vendor-user-password",
  function (input: RegenerateVendorUserPasswordWorkflowInput) {
    const result = regenerateVendorUserPasswordStep(input)

    return new WorkflowResponse(result)
  },
)
