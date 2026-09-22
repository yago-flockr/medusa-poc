import type { AffiliateProductSales } from "@dtc/api-contracts/affiliate/sales"

export type ReferredOrderItem = {
  product_id?: string | null
  product_title?: string | null
  product_handle?: string | null
  quantity?: number | null
  unit_price?: number | null
  detail?: { return_received_quantity?: number | null } | null
}

export type ReferredOrder = {
  id?: string | null
  items?: (ReferredOrderItem | null)[] | null
}

export type { AffiliateProductSales }

export function buildAffiliateProductSales(
  orders: (ReferredOrder | null)[],
): AffiliateProductSales[] {
  const byProduct = new Map<string, AffiliateProductSales>()
  const orderIdsByProduct = new Map<string, Set<string>>()

  for (const order of orders) {
    if (!order?.id) {
      continue
    }

    for (const item of order.items ?? []) {
      if (!item?.product_id) {
        continue
      }

      const existing = byProduct.get(item.product_id) ?? {
        product_id: item.product_id,
        product_title: item.product_title ?? null,
        product_handle: item.product_handle ?? null,
        units_sold: 0,
        units_returned: 0,
        revenue: 0,
        orders: 0,
      }

      existing.units_sold += item.quantity ?? 0
      existing.units_returned += item.detail?.return_received_quantity ?? 0
      existing.revenue += (item.unit_price ?? 0) * (item.quantity ?? 0)

      byProduct.set(item.product_id, existing)

      const orderIds = orderIdsByProduct.get(item.product_id) ?? new Set()
      orderIds.add(order.id)
      orderIdsByProduct.set(item.product_id, orderIds)
    }
  }

  return [...byProduct.values()]
    .map((sales) => ({
      ...sales,
      orders: orderIdsByProduct.get(sales.product_id)?.size ?? 0,
    }))
    .sort((a, b) => b.units_sold - a.units_sold)
}
