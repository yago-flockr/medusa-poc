import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type UpdateVendorUserStepInput = {
  id: string
  first_name?: string | null
  last_name?: string | null
}

type UpdateVendorUserCompensation = {
  id: string
  first_name: string | null
  last_name: string | null
}

export const updateVendorUserStep = createStep(
  "update-vendor-user",
  async (input: UpdateVendorUserStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const existing = await vendorModuleService.retrieveVendorUser(input.id)

    const update: { id: string; first_name?: string | null; last_name?: string | null } = {
      id: input.id,
    }

    if (input.first_name !== undefined) {
      update.first_name = input.first_name
    }

    if (input.last_name !== undefined) {
      update.last_name = input.last_name
    }

    const vendorUser = await vendorModuleService.updateVendorUsers(update)

    return new StepResponse(vendorUser, {
      id: existing.id,
      first_name: existing.first_name,
      last_name: existing.last_name,
    } satisfies UpdateVendorUserCompensation)
  },
  async (
    compensation: UpdateVendorUserCompensation | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.updateVendorUsers({
      id: compensation.id,
      first_name: compensation.first_name,
      last_name: compensation.last_name,
    })
  },
)
