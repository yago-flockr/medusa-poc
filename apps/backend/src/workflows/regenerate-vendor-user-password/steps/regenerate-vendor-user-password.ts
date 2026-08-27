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

    // The emailpass provider keys its provider identity by email (its
    // `entity_id`), not by our vendor_user id — confirmed by reading the
    // provider's own source, since the Auth Module's own doc comment for
    // `updateProvider` is misleading here.
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
  // Regenerating a password is inherently irreversible — the prior
  // password was random and was never stored anywhere to restore. This is
  // a deliberate no-op compensation, not a skipped one.
  async () => undefined,
)
