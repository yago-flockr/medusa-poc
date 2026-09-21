import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  groupItemsByVendor,
  type VendorRoutableItem,
} from "../mappers/group-items-by-vendor"

export type { VendorRoutableItem }

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

    return new StepResponse({
      vendorsItems: groupItemsByVendor(items, vendorIdByProductId),
    })
  },
)
