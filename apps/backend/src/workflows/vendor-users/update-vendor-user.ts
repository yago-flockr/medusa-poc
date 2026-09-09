import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateVendorUserStep,
  type UpdateVendorUserStepInput,
} from "./steps/update-vendor-user"
import { buildVendorUser } from "./mappers/build-vendor-user"

export type UpdateVendorUserWorkflowInput = UpdateVendorUserStepInput

export const updateVendorUserWorkflow = createWorkflow(
  "update-vendor-user",
  function (input: UpdateVendorUserWorkflowInput) {
    const vendorUser = updateVendorUserStep(input)
    const response = transform({ vendorUser }, (data) =>
      buildVendorUser(data.vendorUser),
    )

    return new WorkflowResponse(response)
  },
)
