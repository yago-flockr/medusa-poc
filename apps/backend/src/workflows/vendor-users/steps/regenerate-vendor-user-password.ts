import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"
import { generateRandomPassword } from "../../../lib/generate-random-password"

export type RegenerateVendorUserPasswordStepInput = {
  vendorUserId: string
}

export const regenerateVendorUserPasswordStep = createStep(
  "regenerate-vendor-user-password",
  async (input: RegenerateVendorUserPasswordStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)
    const authModuleService = container.resolve(Modules.AUTH)

    const vendorUser = await vendorModuleService.retrieveVendorUser(
      input.vendorUserId,
    )
    const password = generateRandomPassword()

    // emailpass keys identity by email (entity_id), not vendor_user id —
    // its own doc comment for updateProvider is misleading here.
    const { success, error } = await authModuleService.updateProvider(
      "emailpass",
      { password, entity_id: vendorUser.email },
    )

    if (!success) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        error ?? "Could not regenerate this vendor user's password.",
      )
    }

    return new StepResponse({ password })
  },
  // Irreversible: the prior random password was never stored, so this is
  // a deliberate no-op compensation.
  async () => undefined,
)
