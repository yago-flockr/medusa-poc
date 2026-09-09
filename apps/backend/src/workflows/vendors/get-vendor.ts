import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getVendorStep, type GetVendorStepInput } from "./steps/get-vendor"
import { buildVendor } from "./mappers/build-vendor"

export type GetVendorWorkflowInput = GetVendorStepInput

export const getVendorWorkflow = createWorkflow(
  "get-vendor",
  function (input: GetVendorWorkflowInput) {
    const vendor = getVendorStep(input)
    const response = transform({ vendor }, (data) => buildVendor(data.vendor))

    return new WorkflowResponse(response)
  },
)
