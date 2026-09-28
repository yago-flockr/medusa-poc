import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

import { graph } from "../../../lib/query"

const referralOrderRowSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
  commission_total: z.coerce.number(),
  order: z
    .object({
      display_id: z.coerce.number(),
      items: z
        .array(z.object({ quantity: z.coerce.number() }).nullable())
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})

export type ReferralOrderRow = z.infer<typeof referralOrderRowSchema>

export type ListReferralOrdersStepInput = {
  affiliateId: string
  limit: number
  offset: number
}

export const listReferralOrdersStep = createStep(
  "list-referral-orders",
  async (
    { affiliateId, limit, offset }: ListReferralOrdersStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: referrals, metadata } = await graph(query, {
      entity: "referral",
      fields: [
        "id",
        "currency_code",
        "commission_total",
        "order.display_id",
        "order.items.quantity",
        "order.items.detail.quantity",
      ],
      filters: { affiliate_id: affiliateId },
      pagination: { skip: offset, take: limit, order: { created_at: "DESC" } },
    })

    return new StepResponse({
      referrals: z.array(referralOrderRowSchema).parse(referrals),
      count: metadata?.count ?? 0,
    })
  },
)
