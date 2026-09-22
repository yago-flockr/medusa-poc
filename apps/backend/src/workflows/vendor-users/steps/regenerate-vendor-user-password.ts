import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"
import { regenerateActorPassword } from "../../shared/lib/actor-auth"

export type RegenerateVendorUserPasswordStepInput = {
  vendorUserId: string
}

export const regenerateVendorUserPasswordStep = createStep(
  "regenerate-vendor-user-password",
  async (input: RegenerateVendorUserPasswordStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const vendorUser = await vendorModuleService.retrieveVendorUser(
      input.vendorUserId,
    )

    return new StepResponse(
      await regenerateActorPassword({ container, email: vendorUser.email }),
    )
  },
  // Irreversible: the prior random password was never stored.
  async () => undefined,
)
