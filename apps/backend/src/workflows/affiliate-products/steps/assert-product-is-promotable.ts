import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type AssertProductIsPromotableStepInput = {
  affiliateId: string
  productId: string
}

export const assertProductIsPromotableStep = createStep(
  "assert-product-is-promotable",
  async (
    { affiliateId, productId }: AssertProductIsPromotableStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [product],
    } = await query.graph({
      entity: "product",
      fields: ["id", "status"],
      filters: { id: productId },
    })

    if (!product) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id: ${productId} was not found`,
      )
    }

    if (product.status !== "published") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only a published product can be promoted.",
      )
    }

    const {
      data: [affiliate],
    } = await query.graph({
      entity: "affiliate",
      fields: ["id", "products.id"],
      filters: { id: affiliateId },
    })

    const alreadyPromoted = (affiliate?.products ?? []).some(
      (promoted) => promoted?.id === productId,
    )

    if (alreadyPromoted) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This product is already promoted by this affiliate.",
      )
    }

    return new StepResponse(true)
  },
)
