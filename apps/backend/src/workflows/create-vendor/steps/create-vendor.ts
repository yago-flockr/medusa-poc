import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { toHandle } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type CreateVendorStepInput = {
  name: string
  handle?: string
}

export const createVendorStep = createStep(
  "create-vendor",
  async (input: CreateVendorStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const vendor = await vendorModuleService.createVendors({
      name: input.name,
      handle: input.handle ?? toHandle(input.name),
    })

    return new StepResponse(vendor, vendor.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.deleteVendors(id)
  },
)
