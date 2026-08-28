import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { assertVendorHasNoOrdersStep } from "./steps/assert-vendor-has-no-orders"
import {
  deleteVendorStep,
  type DeleteVendorStepInput,
} from "./steps/delete-vendor"

export type DeleteVendorWorkflowInput = DeleteVendorStepInput

export const deleteVendorWorkflow = createWorkflow(
  "delete-vendor",
  function (input: DeleteVendorWorkflowInput) {
    assertVendorHasNoOrdersStep(input)
    const result = deleteVendorStep(input)

    return new WorkflowResponse(result)
  },
)
