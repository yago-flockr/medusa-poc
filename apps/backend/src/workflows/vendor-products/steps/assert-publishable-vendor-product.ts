import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { isVariantComplete } from "../mappers/is-variant-complete"

export type AssertPublishableVendorProductStepInput = {
  productId: string
}

export const assertPublishableVendorProductStep = createStep(
  "assert-publishable-vendor-product",
  async (
    { productId }: AssertPublishableVendorProductStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [product],
    } = await query.graph({
      entity: "product",
      fields: ["id", "variants.id", "variants.title", "variants.sku"],
      filters: { id: productId },
    })

    const incompleteVariants = (product?.variants ?? []).filter(
      (variant) => !variant || !isVariantComplete(variant),
    )

    if (incompleteVariants.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot publish product: variant(s) missing SKU: ${incompleteVariants
          .map((variant) => variant?.title)
          .join(", ")}`,
      )
    }
  },
)
