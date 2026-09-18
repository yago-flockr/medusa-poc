import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { buildAffiliateProductSales } from "./mappers/build-affiliate-product-sales"

export type GetAffiliateProductSalesWorkflowInput = {
  affiliate_id: string
}

export const getAffiliateProductSalesWorkflow = createWorkflow(
  "get-affiliate-product-sales",
  function (input: GetAffiliateProductSalesWorkflowInput) {
    const { data: referrals } = useQueryGraphStep({
      entity: "referral",
      fields: ["id", "order.id", "order.items.*"],
      filters: { affiliate_id: input.affiliate_id },
    })

    const productSales = transform({ referrals }, (data) =>
      buildAffiliateProductSales(
        data.referrals.map((referral) => referral.order),
      ),
    )

    return new WorkflowResponse({ product_sales: productSales })
  },
)
