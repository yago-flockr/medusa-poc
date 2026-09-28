import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildAffiliateOrderDetail } from "./mappers/build-affiliate-order-detail"
import { getReferralOrderStep } from "./steps/get-referral-order"

export type GetAffiliateOrderWorkflowInput = {
  affiliate_id: string
  id: string
}

export const getAffiliateOrderWorkflow = createWorkflow(
  "get-affiliate-order",
  function (input: GetAffiliateOrderWorkflowInput) {
    const getReferralOrder = getReferralOrderStep({
      referralId: input.id,
      affiliateId: input.affiliate_id,
    })

    const response = transform({ getReferralOrder }, (data) =>
      buildAffiliateOrderDetail(data.getReferralOrder),
    )

    return new WorkflowResponse(response)
  },
)
