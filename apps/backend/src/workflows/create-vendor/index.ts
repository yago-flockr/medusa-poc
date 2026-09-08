import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  createShippingProfilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../modules/vendor"
import {
  createVendorStep,
  type CreateVendorStepInput,
} from "./steps/create-vendor"

export type CreateVendorWorkflowInput = CreateVendorStepInput

export const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const vendor = createVendorStep(input)

    // Its own shipping profile, not the store's shared default — this is
    // what lets a multi-vendor cart later hold one shipping method per
    // vendor without adding one evicting another (see
    // links/vendor-shipping-profile.ts).
    const shippingProfileInput = transform({ vendor }, (data) => ({
      data: [{ name: `${data.vendor.name} Shipping Profile`, type: "default" }],
    }))

    const shippingProfiles = createShippingProfilesWorkflow.runAsStep({
      input: shippingProfileInput,
    })

    const shippingProfile = transform({ shippingProfiles }, (data) => data.shippingProfiles[0])

    const linkDefs = transform(
      { vendor, shippingProfile },
      (data): LinkDefinition[] => [
        {
          [VENDOR_MODULE]: { vendor_id: data.vendor.id },
          [Modules.FULFILLMENT]: { shipping_profile_id: data.shippingProfile.id },
        },
      ],
    )

    createRemoteLinkStep(linkDefs)

    return new WorkflowResponse(vendor)
  },
)

export default createVendorWorkflow
