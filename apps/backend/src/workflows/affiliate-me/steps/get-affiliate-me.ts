import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

const affiliateMeSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  email: z.string(),
  commission_rate: z.number(),
  is_active: z.boolean(),
})

export type GetAffiliateMeStepInput = {
  actorId: string
}

export const getAffiliateMeStep = createStep(
  "get-affiliate-me",
  async ({ actorId }: GetAffiliateMeStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawAffiliate],
    } = await query.graph({
      entity: "",
      fields: ["id", "name", "handle", "email", "commission_rate", "is_active"],
      filters: { id: [actorId] },
    })

    if (!rawAffiliate) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Affiliate not found.",
      )
    }

    const affiliate = affiliateMeSchema.parse(rawAffiliate)

    if (!affiliate.is_active) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This affiliate is disabled.",
      )
    }

    return new StepResponse(affiliate)
  },
)
