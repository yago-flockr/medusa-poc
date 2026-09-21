import { MedusaError } from "@medusajs/framework/utils"

// Works for either cart or order line items — both carry these two fields,
// and grouping-by-vendor never needs anything else.
export type VendorRoutableItem = {
  id: string
  product_id?: string | null
}

export function groupItemsByVendor(
  items: VendorRoutableItem[],
  vendorIdByProductId: Map<string, string>,
): Record<string, VendorRoutableItem[]> {
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

  return vendorsItems
}
