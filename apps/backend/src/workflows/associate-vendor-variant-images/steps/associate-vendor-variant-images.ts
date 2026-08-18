import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { IProductModuleService } from "@medusajs/framework/types"

export type VariantImageAssociation = {
  variantId: string
  imageIds: string[]
  thumbnail?: string
}

export type AssociateVendorVariantImagesStepInput = {
  associations: VariantImageAssociation[]
}

/**
 * Associates already-uploaded images (and a thumbnail) to already-created
 * variants — a separate step because `createProductsWorkflow` has no inline
 * field for it, only `productModuleService.addImageToVariant` /
 * `updateProductVariants` once both the image and variant ids exist. No
 * compensation: this is supplementary metadata, not core commerce data — if
 * it partially fails, the product/variants/prices it runs after still exist
 * correctly, only the image-to-variant link would be missing.
 */
export const associateVendorVariantImagesStep = createStep(
  "associate-vendor-variant-images",
  async (input: AssociateVendorVariantImagesStepInput, { container }) => {
    const productModuleService: IProductModuleService = container.resolve(
      Modules.PRODUCT,
    )

    for (const association of input.associations) {
      if (association.imageIds.length) {
        await productModuleService.addImageToVariant(
          association.imageIds.map((imageId) => ({
            image_id: imageId,
            variant_id: association.variantId,
          })),
        )
      }

      if (association.thumbnail) {
        await productModuleService.updateProductVariants(
          association.variantId,
          { thumbnail: association.thumbnail },
        )
      }
    }

    return new StepResponse(input.associations)
  },
)
