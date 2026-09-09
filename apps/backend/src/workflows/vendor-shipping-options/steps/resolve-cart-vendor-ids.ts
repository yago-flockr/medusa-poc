import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type ResolveCartVendorIdsStepInput = {
  cartId: string
}

export const resolveCartVendorIdsStep = createStep(
  "resolve-cart-vendor-ids",
  async ({ cartId }: ResolveCartVendorIdsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [cart],
    } = await query.graph({
      entity: "cart",
      fields: ["id", "items.product_id"],
      filters: { id: cartId },
    })

    const productIds = [
      ...new Set(
        (cart?.items ?? [])
          .map((item) => item?.product_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id: productIds },
    })

    return new StepResponse(
      products
        .map((product) => product.vendor?.id)
        .filter((id): id is string => Boolean(id)),
    )
  },
)
