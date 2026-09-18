import { toHandle } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import AffiliateModuleService from "../../../modules/affiliate/service"

export type CreateAffiliateStepInput = {
  name: string
  email: string
  handle?: string
  commission_rate: number
}

export const createAffiliateStep = createStep(
  "create-affiliate",
  async (input: CreateAffiliateStepInput, { container }) => {
    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    const affiliate = await affiliateModuleService.createAffiliates({
      name: input.name,
      email: input.email,
      handle: input.handle ?? toHandle(input.name),
      commission_rate: input.commission_rate,
    })

    return new StepResponse(affiliate, affiliate.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.deleteAffiliates(id)
  },
)
