import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  getVendorMeStep,
  type GetVendorMeStepInput,
} from "./steps/get-vendor-me"
import { buildVendorMe } from "./mappers/build-vendor-me"

export type GetVendorMeWorkflowInput = GetVendorMeStepInput

export const getVendorMeWorkflow = createWorkflow(
  "get-vendor-me",
  function (input: GetVendorMeWorkflowInput) {
    const vendorUser = getVendorMeStep(input)
    const response = transform({ vendorUser }, (data) =>
      buildVendorMe(data.vendorUser),
    )

    return new WorkflowResponse(response)
  },
)
