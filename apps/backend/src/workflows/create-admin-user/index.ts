import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createUsersWorkflow,
  setAuthAppMetadataStep,
} from "@medusajs/medusa/core-flows"
import { registerAdminAuthIdentityStep } from "./steps/register-admin-auth-identity"

export type CreateAdminUserWorkflowInput = {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export const createAdminUserWorkflow = createWorkflow(
  "create-admin-user",
  function (input: CreateAdminUserWorkflowInput) {
    const authIdentity = registerAdminAuthIdentityStep({
      email: input.email,
      password: input.password,
    })

    const users = createUsersWorkflow.runAsStep({
      input: {
        users: [
          {
            email: input.email,
            first_name: input.first_name,
            last_name: input.last_name,
          },
        ],
      },
    })

    const user = transform({ users }, (data) => data.users[0])

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "user",
      value: user.id,
    })

    return new WorkflowResponse(user)
  },
)
