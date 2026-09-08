import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type AssertVendorHasShippingProfileStepInput = {
  vendorId: string
  shippingProfileId: string | null | undefined
}

// A real step, not a transform() check — transform runs at workflow
// definition time, so throwing inside one never surfaces as an actual
// workflow failure (caught by @medusajs/no-throw-in-transform).
export const assertVendorHasShippingProfileStep = createStep(
  "assert-vendor-has-shipping-profile",
  async ({ vendorId, shippingProfileId }: AssertVendorHasShippingProfileStepInput) => {
    if (!shippingProfileId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Vendor ${vendorId} has no shipping profile — every vendor should get one at creation time.`,
      )
    }

    return new StepResponse(shippingProfileId)
  },
)
