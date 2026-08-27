import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { AuthenticationInput } from "@medusajs/framework/types"
import { generateRandomPassword } from "../../../lib/generate-random-password"

export type RegisterVendorAuthIdentityStepInput = {
  email: string
}

/**
 * Security, not UX: every vendor user gets a random password, never one
 * staff types in. Staff can regenerate a new one later (see
 * regenerate-vendor-user-password); there is no self-service reset yet.
 * Calls the Auth Module's own `register` so hashing is done by Medusa's
 * real emailpass provider, never hand-rolled here.
 */
export const registerVendorAuthIdentityStep = createStep(
  "register-vendor-auth-identity",
  async (input: RegisterVendorAuthIdentityStepInput, { container }) => {
    const authModuleService = container.resolve(Modules.AUTH)
    const password = generateRandomPassword()

    const { success, authIdentity, error } = await authModuleService.register(
      "emailpass",
      {
        url: "",
        headers: {},
        query: {},
        protocol: "https",
        body: { email: input.email, password },
      } as AuthenticationInput,
    )

    if (!success || !authIdentity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error ?? "Could not create a login for this vendor user.",
      )
    }

    return new StepResponse({ authIdentity, password }, authIdentity.id)
  },
  async (authIdentityId: string | undefined, { container }) => {
    if (!authIdentityId) {
      return
    }

    const authModuleService = container.resolve(Modules.AUTH)
    await authModuleService.deleteAuthIdentities([authIdentityId])
  },
)
