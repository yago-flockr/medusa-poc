import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  getVendorUserStep,
  type GetVendorUserStepInput,
} from "./steps/get-vendor-user"
import { buildVendorUser } from "./mappers/build-vendor-user"

export type GetVendorUserWorkflowInput = GetVendorUserStepInput

export const getVendorUserWorkflow = createWorkflow(
  "get-vendor-user",
  function (input: GetVendorUserWorkflowInput) {
    const vendorUser = getVendorUserStep(input)
    const response = transform({ vendorUser }, (data) =>
      buildVendorUser(data.vendorUser),
    )

    return new WorkflowResponse(response)
  },
)
