import type { AffiliateOrder } from "@dtc/api-contracts/affiliate/orders"
import { roundMoney } from "../../../lib/money"
import type { ReferralOrderRow } from "../steps/list-referral-orders"

export function buildAffiliateOrders(
  referrals: ReferralOrderRow[],
): AffiliateOrder[] {
  return referrals.flatMap(({ order, ...referral }) => {
    if (!order) {
      return []
    }

    return [
      {
        id: referral.id,
        display_id: order.display_id,
        currency_code: referral.currency_code,
        units: (order.items ?? []).reduce(
          (sum, item) => sum + (item?.quantity ?? 0),
          0,
        ),
        commission_total: roundMoney(referral.commission_total),
      },
    ]
  })
}
