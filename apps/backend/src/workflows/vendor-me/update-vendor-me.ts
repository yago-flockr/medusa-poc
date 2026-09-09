import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { updateVendorUserStep } from "../vendor-users/steps/update-vendor-user"

export type UpdateVendorMeWorkflowInput = {
  actorId: string
  first_name: string
  last_name: string
}

export const updateVendorMeWorkflow = createWorkflow(
  "update-vendor-me",
  function (input: UpdateVendorMeWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const updateInput = transform({ resolveVendorUser, input }, (data) => ({
      id: data.resolveVendorUser.id,
      first_name: data.input.first_name,
      last_name: data.input.last_name,
    }))
    const vendorUser = updateVendorUserStep(updateInput)

    const response = transform({ vendorUser }, (data) => ({
      vendor_user: {
        id: data.vendorUser.id,
        first_name: data.vendorUser.first_name,
        last_name: data.vendorUser.last_name,
      },
    }))

    return new WorkflowResponse(response)
  },
)
