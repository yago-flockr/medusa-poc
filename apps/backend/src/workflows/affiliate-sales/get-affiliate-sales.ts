import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { buildAffiliateSalesTotals } from "./mappers/build-affiliate-sales-totals"

export type GetAffiliateSalesWorkflowInput = {
  affiliate_id: string
}

export const getAffiliateSalesWorkflow = createWorkflow(
  "get-affiliate-sales",
  function (input: GetAffiliateSalesWorkflowInput) {
    const { data: referrals } = useQueryGraphStep({
      entity: "referral",
      fields: [
        "id",
        "subtotal",
        "commission_total",
        "order.id",
        "order.items.quantity",
        "order.items.detail.quantity",
      ],
      filters: { affiliate_id: input.affiliate_id },
    })

    const response = transform({ referrals }, (data) => ({
      totals: buildAffiliateSalesTotals(data.referrals),
    }))

    return new WorkflowResponse(response)
  },
)
