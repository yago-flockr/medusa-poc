import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { createVendorStep } from "./steps/create-vendor"
import { createVendorUserStep } from "./steps/create-vendor-user"

export type CreateVendorWorkflowInput = {
  name: string
  handle?: string
  user: {
    email: string
    first_name?: string
    last_name?: string
  }
  authIdentityId: string
}

export const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const vendor = createVendorStep({
      name: input.name,
      handle: input.handle,
    })

    const vendorUserData = transform({ input, vendor }, (data) => ({
      ...data.input.user,
      vendor_id: data.vendor.id,
    }))

    const vendorUser = createVendorUserStep(vendorUserData)

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorUser.id,
    })

    const result = transform({ vendor, vendorUser }, (data) => ({
      ...data.vendor,
      users: [data.vendorUser],
    }))

    return new WorkflowResponse({ vendor: result })
  },
)
