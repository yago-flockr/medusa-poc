import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { graph } from "../../../lib/query"

const referralOrderDetailSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
  order: z.object({
    display_id: z.coerce.number(),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        variant_title: z.string().nullable(),
        variant_sku: z.string().nullable(),
        quantity: z.coerce.number(),
        unit_price: z.coerce.number(),
      }),
    ),
  }),
})

export type ReferralOrderDetail = z.infer<typeof referralOrderDetailSchema>

export type GetReferralOrderStepInput = {
  referralId: string
  affiliateId: string
}

export const getReferralOrderStep = createStep(
  "get-referral-order",
  async (
    { referralId, affiliateId }: GetReferralOrderStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawReferral],
    } = await graph(query, {
      entity: "referral",
      fields: [
        "id",
        "currency_code",
        "order.display_id",
        "order.items.id",
        "order.items.title",
        "order.items.variant_title",
        "order.items.variant_sku",
        "order.items.quantity",
        "order.items.detail.quantity",
        "order.items.unit_price",
      ],
      filters: { id: referralId, affiliate_id: affiliateId },
    })

    const referral = referralOrderDetailSchema.safeParse(rawReferral)

    if (!referral.success) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order with id: ${referralId} was not found`,
      )
    }

    return new StepResponse(referral.data)
  },
)
