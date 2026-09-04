import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { createVendorUserStep } from "./steps/create-vendor-user"
import { registerVendorAuthIdentityStep } from "./steps/register-vendor-auth-identity"

export type CreateVendorUserWorkflowInput = {
  vendor_id: string
  email: string
  first_name?: string
  last_name?: string
  password?: string
}

export const createVendorUserWorkflow = createWorkflow(
  "create-vendor-user",
  function (input: CreateVendorUserWorkflowInput) {
    const { authIdentity, password } = registerVendorAuthIdentityStep({
      email: input.email,
      password: input.password,
    })

    const vendorUser = createVendorUserStep({
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      vendor_id: input.vendor_id,
    })

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "vendor",
      value: vendorUser.id,
    })

    const result = transform({ vendorUser, password }, (data) => ({
      ...data.vendorUser,
      password: data.password,
    }))

    return new WorkflowResponse(result)
  },
)
