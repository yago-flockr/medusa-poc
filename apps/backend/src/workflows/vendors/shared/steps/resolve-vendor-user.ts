import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ResolveVendorUserStepInput = {
  actorId: string
}

export type ResolveVendorUserStepOutput = {
  id: string
  vendorId: string
}

export const resolveVendorUserStep = createStep(
  "resolve-vendor-user",
  async ({ actorId }: ResolveVendorUserStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [vendorUser],
    } = await query.graph({
      entity: "vendor_user",
      fields: ["id", "vendor_id", "is_active", "vendor.is_active"],
      filters: { id: [actorId] },
    })

    if (!vendorUser) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Vendor user is not associated with a vendor.",
      )
    }

    if (!vendorUser.is_active || !vendorUser.vendor?.is_active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This vendor user is disabled.",
      )
    }

    return new StepResponse<ResolveVendorUserStepOutput>({
      id: vendorUser.id,
      vendorId: vendorUser.vendor_id,
    })
  },
)
