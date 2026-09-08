import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { resolveVendorShippingProfileId } from "../../../lib/resolve-vendor-shipping-profile"

export type ResolveVendorShippingProfileStepInput = {
  vendorId: string
}

export const resolveVendorShippingProfileStep = createStep(
  "resolve-vendor-shipping-profile",
  async ({ vendorId }: ResolveVendorShippingProfileStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const shippingProfileId = await resolveVendorShippingProfileId(query, vendorId)

    return new StepResponse({ shippingProfileId })
  },
)
