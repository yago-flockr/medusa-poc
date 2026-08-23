import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

const VENDOR_UPDATABLE_FIELDS = [
  "name",
  "handle",
  "is_active",
  "shopify_store_domain",
  "shopify_client_id",
  "shopify_client_secret",
  "shopify_access_token",
  "shopify_scope",
  "shopify_connected_at",
] as const

type VendorUpdatableField = (typeof VENDOR_UPDATABLE_FIELDS)[number]

export type UpdateVendorStepInput = {
  id: string
  name?: string
  handle?: string
  is_active?: boolean
  shopify_store_domain?: string
  shopify_client_id?: string
  shopify_client_secret?: string
  shopify_access_token?: string
  shopify_scope?: string
  shopify_connected_at?: Date
}

type UpdateVendorCompensation = { id: string } & Record<
  VendorUpdatableField,
  string | boolean | Date | null
>

export const updateVendorStep = createStep(
  "update-vendor",
  async (input: UpdateVendorStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const existing = await vendorModuleService.retrieveVendor(input.id)

    const update: Record<string, unknown> = { id: input.id }
    const compensation: Record<string, unknown> = { id: existing.id }

    for (const field of VENDOR_UPDATABLE_FIELDS) {
      compensation[field] = existing[field]

      if (input[field] !== undefined) {
        update[field] = input[field]
      }
    }

    const vendor = await vendorModuleService.updateVendors(
      update as Parameters<VendorModuleService["updateVendors"]>[0],
    )

    return new StepResponse(vendor, compensation as UpdateVendorCompensation)
  },
  async (compensation: UpdateVendorCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    await vendorModuleService.updateVendors(
      compensation as unknown as Parameters<
        VendorModuleService["updateVendors"]
      >[0],
    )
  },
)
