import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// Works for either cart or order line items — both carry these two fields,
// and grouping-by-vendor never needs anything else.
export type VendorRoutableItem = {
  id: string
  product_id?: string | null
}

export type GroupVendorItemsStepInput = {
  items: VendorRoutableItem[]
}

export const groupVendorItemsStep = createStep(
  "group-vendor-items",
  async ({ items }: GroupVendorItemsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const productIds = [
      ...new Set(
        items
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id)),
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

    const vendorsItems: Record<string, VendorRoutableItem[]> = {}

    for (const item of items) {
      const vendorId = item.product_id
        ? vendorIdByProductId.get(item.product_id)
        : undefined

      if (!vendorId) {
        // assert-items-fulfillable.ts should already guarantee this.
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
