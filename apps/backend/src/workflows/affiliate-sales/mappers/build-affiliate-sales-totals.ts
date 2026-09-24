import type { AffiliateSalesTotals } from "@dtc/api-contracts/affiliate/sales"
import { roundMoney } from "../../../lib/money"

export type ReferralRecord = {
  subtotal?: number | null
  commission_total?: number | null
  order?: {
    id?: string | null
    items?: ({ quantity?: number | null } | null)[] | null
  } | null
}

export function buildAffiliateSalesTotals(
  referrals: (ReferralRecord | null)[],
): AffiliateSalesTotals {
  return referrals.reduce<AffiliateSalesTotals>(
    (totals, referral) => {
      if (!referral?.order?.id) {
        return totals
      }

      return {
        orders: totals.orders + 1,
        units_sold:
          totals.units_sold +
          (referral.order.items ?? []).reduce(
            (sum, item) => sum + (item?.quantity ?? 0),
            0,
          ),
        revenue: roundMoney(totals.revenue + Number(referral.subtotal ?? 0)),
        commission_total: roundMoney(
          totals.commission_total + Number(referral.commission_total ?? 0),
        ),
      }
    },
    { orders: 0, units_sold: 0, revenue: 0, commission_total: 0 },
  )
}
