import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { updateVendorUserStep } from "../vendor-users/steps/update-vendor-user"

export type UpdateVendorMeWorkflowInput = {
  actorId: string
  name: string
}

export const updateVendorMeWorkflow = createWorkflow(
  "update-vendor-me",
  function (input: UpdateVendorMeWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const updateInput = transform({ resolveVendorUser, input }, (data) => ({
      id: data.resolveVendorUser.id,
      name: data.input.name,
    }))
    const vendorUser = updateVendorUserStep(updateInput)

    const response = transform({ vendorUser }, (data) => ({
      vendor_user: {
        id: data.vendorUser.id,
        name: data.vendorUser.name,
      },
    }))

    return new WorkflowResponse(response)
  },
)
