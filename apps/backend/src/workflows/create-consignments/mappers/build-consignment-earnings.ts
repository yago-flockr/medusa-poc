import {
  roundMoney,
  sumItemsSubtotal,
  type PricedItem,
} from "../../../lib/money"

export type { PricedItem }

export type ConsignmentEarnings = {
  subtotal: number
  commission_rate: number
  commission_total: number
  earning_total: number
}

export function buildConsignmentEarnings(
  items: PricedItem[],
  commissionRate: number,
): ConsignmentEarnings {
  const subtotal = sumItemsSubtotal(items)
  const commissionTotal = roundMoney(subtotal * commissionRate)

  return {
    subtotal,
    commission_rate: commissionRate,
    commission_total: commissionTotal,
    earning_total: roundMoney(subtotal - commissionTotal),
  }
}
