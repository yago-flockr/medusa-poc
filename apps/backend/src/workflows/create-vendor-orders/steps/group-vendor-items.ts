import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, promiseAll } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"

export type GroupVendorItemsStepInput = {
  items: CartLineItemDTO[]
}

export const groupVendorItemsStep = createStep(
  "group-vendor-items",
  async ({ items }: GroupVendorItemsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const vendorsItems: Record<string, CartLineItemDTO[]> = {}

    await promiseAll(
      items.map(async (item) => {
        const {
          data: [product],
        } = await query.graph({
          entity: "product",
          fields: ["vendor.*"],
          filters: { id: item.product_id ?? "" },
        })

        const vendorId = (product as { vendor?: { id: string } | null })?.vendor
          ?.id

        if (!vendorId) {
          return
        }

        vendorsItems[vendorId] = [...(vendorsItems[vendorId] ?? []), item]
      }),
    )

    return new StepResponse({ vendorsItems })
  },
)
