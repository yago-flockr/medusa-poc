import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type UpdateVendorStepInput = {
  id: string
  name?: string
  handle?: string
  is_active?: boolean
}

type UpdateVendorCompensation = {
  id: string
  name: string
  handle: string
  is_active: boolean
}

export const updateVendorStep = createStep(
  "update-vendor",
  async (input: UpdateVendorStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const existing = await vendorModuleService.retrieveVendor(input.id)
    const update: {
      id: string
      name?: string
      handle?: string
      is_active?: boolean
    } = {
      id: input.id,
    }

    if (input.name !== undefined) {
      update.name = input.name
    }

    if (input.handle !== undefined) {
      update.handle = input.handle
    }

    if (input.is_active !== undefined) {
      update.is_active = input.is_active
    }

    const vendor = await vendorModuleService.updateVendors(update)

    return new StepResponse(vendor, {
      id: existing.id,
      name: existing.name,
      handle: existing.handle,
      is_active: existing.is_active,
    } satisfies UpdateVendorCompensation)
  },
  async (compensation: UpdateVendorCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.updateVendors({
      id: compensation.id,
      name: compensation.name,
      handle: compensation.handle,
      is_active: compensation.is_active,
    })
  },
)
