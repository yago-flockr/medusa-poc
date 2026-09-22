import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { graph } from "../../../lib/query"
export type AssertAffiliateHasNoReferralsStepInput = {
  id: string
}

export const assertAffiliateHasNoReferralsStep = createStep(
  "assert-affiliate-has-no-referrals",
  async (input: AssertAffiliateHasNoReferralsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [affiliate],
    } = await graph(query, {
      entity: "affiliate",
      filters: { id: input.id },
      fields: ["id", "referrals.id"],
    })

    const referralCount = affiliate?.referrals?.length ?? 0
    if (referralCount > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Affiliate ${input.id} is attributed to ${referralCount} order(s) — deactivate them instead of deleting, so those orders keep their attribution.`,
      )
    }

    return new StepResponse(true)
  },
)
