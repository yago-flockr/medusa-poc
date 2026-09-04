import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type DeleteVendorUserStepInput = {
  id: string
}

export const deleteVendorUserStep = createStep(
  "delete-vendor-user",
  async (input: DeleteVendorUserStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.retrieveVendorUser(input.id)
    await vendorModuleService.softDeleteVendorUsers(input.id)

    return new StepResponse({ id: input.id }, input.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.restoreVendorUsers(id)
  },
)
