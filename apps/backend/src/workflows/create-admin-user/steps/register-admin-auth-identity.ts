import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { AuthenticationInput } from "@medusajs/framework/types"

export type RegisterAdminAuthIdentityStepInput = {
  email: string
  password: string
}

export const registerAdminAuthIdentityStep = createStep(
  "register-admin-auth-identity",
  async (input: RegisterAdminAuthIdentityStepInput, { container }) => {
    const authModuleService = container.resolve(Modules.AUTH)

    const { success, authIdentity, error } = await authModuleService.register(
      "emailpass",
      {
        url: "",
        headers: {},
        query: {},
        protocol: "https",
        body: { email: input.email, password: input.password },
      } as AuthenticationInput,
    )

    if (!success || !authIdentity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error ?? "Could not create a login for this admin user.",
      )
    }

    return new StepResponse(authIdentity, authIdentity.id)
  },
  async (authIdentityId: string | undefined, { container }) => {
    if (!authIdentityId) {
      return
    }

    const authModuleService = container.resolve(Modules.AUTH)
    await authModuleService.deleteAuthIdentities([authIdentityId])
  },
)
