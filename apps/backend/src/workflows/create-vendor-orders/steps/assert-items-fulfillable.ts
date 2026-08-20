import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"

export type AssertItemsFulfillableStepInput = {
  items: CartLineItemDTO[]
}

// Checked before the cart is ever completed into an order, not after: a
// product with no shipping profile completes checkout today but throws
// when staff later tries to fulfill it — by then the customer already has
// a "successful" order that can never ship. Blocking here means that
// failure surfaces as a checkout error instead, before an unshippable
// order can exist at all.
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
      fields: ["id", "title", "shipping_profile.id"],
      filters: { id: productIds },
    })

    const unfulfillable = products.filter(
      (product) => !product.shipping_profile?.id,
    )

    if (unfulfillable.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot complete this order — missing shipping information for: ${unfulfillable
          .map((product) => product.title)
          .join(", ")}.`,
      )
    }

    return new StepResponse(undefined)
  },
)
