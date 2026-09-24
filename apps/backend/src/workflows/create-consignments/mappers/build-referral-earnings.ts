import {
  roundMoney,
  sumItemsSubtotal,
  type PricedItem,
} from "../../../lib/money"

export type ReferralEarnings = {
  subtotal: number
  commission_total: number
}

export function buildReferralEarnings(
  items: PricedItem[],
  commissionRate: number,
): ReferralEarnings {
  const subtotal = sumItemsSubtotal(items)

  return {
    subtotal,
    commission_total: roundMoney(subtotal * commissionRate),
  }
}
