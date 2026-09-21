import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"
import { assertProductsFulfillable } from "../mappers/assert-products-fulfillable"

export type AssertItemsFulfillableStepInput = {
  items: CartLineItemDTO[]
}

// Checked before order completion — a product with no shipping profile
// would otherwise complete checkout but fail fulfillment later.
export const assertItemsFulfillableStep = createStep(
  "assert-items-fulfillable",
  async ({ items }: AssertItemsFulfillableStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const productIds = [
      ...new Set(
        items
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    if (!productIds.length) {
      return new StepResponse(undefined)
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "shipping_profile.id", "vendor.id"],
      filters: { id: productIds },
    })

    assertProductsFulfillable(products)

    return new StepResponse(undefined)
  },
)
