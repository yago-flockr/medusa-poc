import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"

export type GroupVendorItemsStepInput = {
  items: CartLineItemDTO[]
}

export const groupVendorItemsStep = createStep(
  "group-vendor-items",
  async ({ items }: GroupVendorItemsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const productIds = [
      ...new Set(
        items.map((item) => item.product_id).filter((id): id is string => Boolean(id)),
      ),
    ]

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "vendor.id"],
      filters: { id: productIds },
    })

    const vendorIdByProductId = new Map(
      products
        .filter((product) => product.vendor?.id)
        .map((product) => [product.id, product.vendor!.id]),
    )

    const vendorsItems: Record<string, CartLineItemDTO[]> = {}

    for (const item of items) {
      const vendorId = item.product_id
        ? vendorIdByProductId.get(item.product_id)
        : undefined

      if (!vendorId) {
        // assert-items-fulfillable.ts should have already blocked checkout
        // for this — reaching here means that guarantee broke somewhere, so
        // fail loud rather than silently drop an already-paid-for item.
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Cart item for product ${item.product_id ?? "(unknown)"} has no vendor to route it to.`,
        )
      }

      vendorsItems[vendorId] = [...(vendorsItems[vendorId] ?? []), item]
    }

    return new StepResponse({ vendorsItems })
  },
)
