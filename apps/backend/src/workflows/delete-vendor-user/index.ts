import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteVendorUserStep,
  type DeleteVendorUserStepInput,
} from "./steps/delete-vendor-user"

export type DeleteVendorUserWorkflowInput = DeleteVendorUserStepInput

export const deleteVendorUserWorkflow = createWorkflow(
  "delete-vendor-user",
  function (input: DeleteVendorUserWorkflowInput) {
    const result = deleteVendorUserStep(input)

    return new WorkflowResponse(result)
  },
)

export default deleteVendorUserWorkflow
