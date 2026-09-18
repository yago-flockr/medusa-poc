import type { LinkDefinition } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import type AffiliateModuleService from "../../../modules/affiliate/service"

export type CreateReferralStepInput = {
  orderId: string
  affiliateHandle: string | null
}

export const createReferralStep = createStep(
  "create-referral",
  async (
    { orderId, affiliateHandle }: CreateReferralStepInput,
    { container },
  ) => {
    if (!affiliateHandle) {
      return new StepResponse({ linkDefs: [] as LinkDefinition[] }, null)
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    const [affiliate] = await affiliateModuleService.listAffiliates({
      handle: affiliateHandle,
      is_active: true,
    })

    if (!affiliate) {
      return new StepResponse({ linkDefs: [] as LinkDefinition[] }, null)
    }

    const referral = await affiliateModuleService.createReferrals({
      affiliate_handle: affiliate.handle,
      commission_rate: affiliate.commission_rate,
      affiliate_id: affiliate.id,
    })

    const linkDefs: LinkDefinition[] = [
      {
        [AFFILIATE_MODULE]: { referral_id: referral.id },
        [Modules.ORDER]: { order_id: orderId },
      },
    ]

    return new StepResponse({ linkDefs }, { referralId: referral.id })
  },
  async (compensation, { container }) => {
    if (!compensation?.referralId) {
      return
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.deleteReferrals(compensation.referralId)
  },
)
