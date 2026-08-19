import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type UpdateVendorUserStepInput = {
  id: string
  first_name?: string | null
  last_name?: string | null
  is_active?: boolean
}

type UpdateVendorUserCompensation = {
  id: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
}

export const updateVendorUserStep = createStep(
  "update-vendor-user",
  async (input: UpdateVendorUserStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const existing = await vendorModuleService.retrieveVendorUser(input.id)

    const update: {
      id: string
      first_name?: string | null
      last_name?: string | null
      is_active?: boolean
    } = {
      id: input.id,
    }

    if (input.first_name !== undefined) {
      update.first_name = input.first_name
    }

    if (input.last_name !== undefined) {
      update.last_name = input.last_name
    }

    if (input.is_active !== undefined) {
      update.is_active = input.is_active
    }

    const vendorUser = await vendorModuleService.updateVendorUsers(update)

    return new StepResponse(vendorUser, {
      id: existing.id,
      first_name: existing.first_name,
      last_name: existing.last_name,
      is_active: existing.is_active,
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
      is_active: compensation.is_active,
    })
  },
)
