import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"

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

    // A vendor-less product can't be routed downstream (group-vendor-items.ts).
    const unassigned = products.filter((product) => !product.vendor?.id)

    if (unassigned.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot complete this order — no vendor assigned for: ${unassigned
          .map((product) => product.title)
          .join(", ")}.`,
      )
    }

    return new StepResponse(undefined)
  },
)
