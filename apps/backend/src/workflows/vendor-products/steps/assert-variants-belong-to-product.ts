import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type AssertVariantsBelongToProductStepInput = {
  productId: string
  variantIds: string[]
}

// A vendor's own product ownership is asserted separately — this closes the
// gap where a submitted variant id could belong to a different product.
export const assertVariantsBelongToProductStep = createStep(
  "assert-variants-belong-to-product",
  async (
    { productId, variantIds }: AssertVariantsBelongToProductStepInput,
    { container },
  ) => {
    if (!variantIds.length) {
      return
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: variants } = await query.graph({
      entity: "variant",
      fields: ["id", "product_id"],
      filters: { id: variantIds },
    })

    const ownedIds = new Set(
      variants
        .filter((variant) => variant.product_id === productId)
        .map((variant) => variant.id),
    )
    const foreignIds = variantIds.filter((id) => !ownedIds.has(id))

    if (foreignIds.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Variant(s) not found on this product: ${foreignIds.join(", ")}`,
      )
    }
  },
)
