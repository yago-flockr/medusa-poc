import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import AffiliateModuleService from "../../../modules/affiliate/service"

export type DeleteAffiliateStepInput = {
  id: string
}

export const deleteAffiliateStep = createStep(
  "delete-affiliate",
  async (input: DeleteAffiliateStepInput, { container }) => {
    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.retrieveAffiliate(input.id)
    await affiliateModuleService.softDeleteAffiliates(input.id)

    return new StepResponse({ id: input.id }, input.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.restoreAffiliates(id)
  },
)
