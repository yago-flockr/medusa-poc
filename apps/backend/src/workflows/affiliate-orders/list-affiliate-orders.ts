import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import type { GetAffiliatesOrdersResponse } from "@dtc/api-contracts/affiliate/orders"
import { buildAffiliateOrders } from "./mappers/build-affiliate-orders"
import { listReferralOrdersStep } from "./steps/list-referral-orders"

export type ListAffiliateOrdersWorkflowInput = {
  affiliate_id: string
  limit: number
  offset: number
}

export const listAffiliateOrdersWorkflow = createWorkflow(
  "list-affiliate-orders",
  function (input: ListAffiliateOrdersWorkflowInput) {
    const listReferralOrders = listReferralOrdersStep({
      affiliateId: input.affiliate_id,
      limit: input.limit,
      offset: input.offset,
    })

    const response = transform(
      { listReferralOrders, input },
      (data): GetAffiliatesOrdersResponse => ({
        orders: buildAffiliateOrders(data.listReferralOrders.referrals),
        count: data.listReferralOrders.count,
        limit: data.input.limit,
        offset: data.input.offset,
      }),
    )

    return new WorkflowResponse(response)
  },
)
