import type { VendorOrderFulfillmentStatus } from "@dtc/api-contracts/vendor/orders"

type FulfillmentTrackedItem = {
  quantity: number
  fulfilled_quantity: number
  shipped_quantity: number
  delivered_quantity: number
}

export function deriveFulfillmentStatus(
  items: FulfillmentTrackedItem[],
): VendorOrderFulfillmentStatus {
  const totals = items.reduce(
    (sum, item) => ({
      quantity: sum.quantity + item.quantity,
      fulfilled: sum.fulfilled + item.fulfilled_quantity,
      shipped: sum.shipped + item.shipped_quantity,
      delivered: sum.delivered + item.delivered_quantity,
    }),
    { quantity: 0, fulfilled: 0, shipped: 0, delivered: 0 },
  )

  if (totals.quantity === 0) return "not_fulfilled"
  if (totals.delivered >= totals.quantity) return "delivered"
  if (totals.delivered > 0) return "partially_delivered"
  if (totals.shipped >= totals.quantity) return "shipped"
  if (totals.shipped > 0) return "partially_shipped"
  if (totals.fulfilled >= totals.quantity) return "fulfilled"
  if (totals.fulfilled > 0) return "partially_fulfilled"
  return "not_fulfilled"
}
