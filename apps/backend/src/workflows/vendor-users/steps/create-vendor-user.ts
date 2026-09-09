import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type CreateVendorUserStepInput = {
  email: string
  first_name?: string
  last_name?: string
  vendor_id: string
}

export const createVendorUserStep = createStep(
  "create-vendor-user",
  async (input: CreateVendorUserStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const vendorUser = await vendorModuleService.createVendorUsers(input)

    return new StepResponse(vendorUser, vendorUser.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.deleteVendorUsers(id)
  },
)
