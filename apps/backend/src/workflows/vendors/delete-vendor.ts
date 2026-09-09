import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { assertVendorHasNoConsignmentsStep } from "./steps/assert-vendor-has-no-consignments"
import {
  deleteVendorStep,
  type DeleteVendorStepInput,
} from "./steps/delete-vendor"

export type DeleteVendorWorkflowInput = DeleteVendorStepInput

export const deleteVendorWorkflow = createWorkflow(
  "delete-vendor",
  function (input: DeleteVendorWorkflowInput) {
    assertVendorHasNoConsignmentsStep(input)
    const result = deleteVendorStep(input)

    return new WorkflowResponse(result)
  },
)
