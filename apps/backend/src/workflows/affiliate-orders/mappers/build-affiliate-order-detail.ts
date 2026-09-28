import type { GetAffiliatesOrdersByIdResponse } from "@dtc/api-contracts/affiliate/orders"
import type { ReferralOrderDetail } from "../steps/get-referral-order"

export function buildAffiliateOrderDetail({
  id,
  currency_code,
  order,
}: ReferralOrderDetail): GetAffiliatesOrdersByIdResponse {
  return {
    id,
    display_id: order.display_id,
    currency_code,
    items: order.items,
  }
}
