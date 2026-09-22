import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteActorAuthIdentity,
  registerActorAuthIdentity,
} from "../../shared/lib/actor-auth"

export type RegisterAffiliateAuthIdentityStepInput = {
  email: string
  password?: string
}

export const registerAffiliateAuthIdentityStep = createStep(
  "register-affiliate-auth-identity",
  async (input: RegisterAffiliateAuthIdentityStepInput, { container }) => {
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
