import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteActorAuthIdentity,
  registerActorAuthIdentity,
} from "../../shared/lib/actor-auth"

export type RegisterVendorAuthIdentityStepInput = {
  email: string
  password?: string
}

// Random password, never staff-typed — no self-service reset yet, only
// regenerate-vendor-user-password.
export const registerVendorAuthIdentityStep = createStep(
  "register-vendor-auth-identity",
  async (input: RegisterVendorAuthIdentityStepInput, { container }) => {
    const { authIdentity, password } = await registerActorAuthIdentity({
      container,
      email: input.email,
      password: input.password,
    })

    return new StepResponse({ authIdentity, password }, authIdentity.id)
  },
  async (authIdentityId: string | undefined, { container }) => {
    if (!authIdentityId) {
      return
    }

    await deleteActorAuthIdentity({ container, authIdentityId })
  },
)
