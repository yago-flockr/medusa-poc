import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import AffiliateModuleService from "../../../modules/affiliate/service"
import { regenerateActorPassword } from "../../shared/lib/actor-auth"

export type RegenerateAffiliatePasswordStepInput = {
  affiliateId: string
}

export const regenerateAffiliatePasswordStep = createStep(
  "regenerate-affiliate-password",
  async (input: RegenerateAffiliatePasswordStepInput, { container }) => {
    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    const affiliate = await affiliateModuleService.retrieveAffiliate(
      input.affiliateId,
    )

    return new StepResponse(
      await regenerateActorPassword({ container, email: affiliate.email }),
    )
  },
  // Irreversible: the prior random password was never stored.
  async () => undefined,
)
