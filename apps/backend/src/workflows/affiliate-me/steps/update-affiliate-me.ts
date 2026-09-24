import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import type AffiliateModuleService from "../../../modules/affiliate/service"

export type UpdateAffiliateMeStepInput = {
  actorId: string
  name: string
}

export const updateAffiliateMeStep = createStep(
  "update-affiliate-me",
  async ({ actorId, name }: UpdateAffiliateMeStepInput, { container }) => {
    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    const existing = await affiliateModuleService.retrieveAffiliate(actorId)

    await affiliateModuleService.updateAffiliates({ id: actorId, name })

    return new StepResponse(undefined, {
      id: existing.id,
      name: existing.name,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.updateAffiliates(compensation)
  },
)
