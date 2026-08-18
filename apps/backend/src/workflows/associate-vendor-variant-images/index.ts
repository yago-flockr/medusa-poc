import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  associateVendorVariantImagesStep,
  type AssociateVendorVariantImagesStepInput,
  type VariantImageAssociation,
} from "./steps/associate-vendor-variant-images"

export type AssociateVendorVariantImagesInput =
  AssociateVendorVariantImagesStepInput

export type { VariantImageAssociation }

export const associateVendorVariantImagesWorkflow = createWorkflow(
  "associate-vendor-variant-images",
  function (input: AssociateVendorVariantImagesInput) {
    const result = associateVendorVariantImagesStep(input)
    return new WorkflowResponse(result)
  },
)
