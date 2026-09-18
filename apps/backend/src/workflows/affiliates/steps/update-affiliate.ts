import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"
import AffiliateModuleService from "../../../modules/affiliate/service"

const AFFILIATE_UPDATABLE_FIELDS = [
  "name",
  "handle",
  "email",
  "commission_rate",
  "is_active",
] as const

type AffiliateUpdatableField = (typeof AFFILIATE_UPDATABLE_FIELDS)[number]

export type UpdateAffiliateStepInput = {
  id: string
  name?: string
  handle?: string
  email?: string
  commission_rate?: number
  is_active?: boolean
}

type UpdateAffiliateCompensation = { id: string } & Partial<
  Record<AffiliateUpdatableField, string | number | boolean | null>
>

export const updateAffiliateStep = createStep(
  "update-affiliate",
  async (input: UpdateAffiliateStepInput, { container }) => {
    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    const existing = await affiliateModuleService.retrieveAffiliate(input.id)

    const update: Record<string, unknown> = { id: input.id }
    const compensation: Record<string, unknown> = { id: existing.id }

    for (const field of AFFILIATE_UPDATABLE_FIELDS) {
      if (input[field] !== undefined) {
        compensation[field] = existing[field]
        update[field] = input[field]
      }
    }

    const affiliate = await affiliateModuleService.updateAffiliates(
      update as Parameters<AffiliateModuleService["updateAffiliates"]>[0],
    )

    return new StepResponse(
      affiliate,
      compensation as UpdateAffiliateCompensation,
    )
  },
  async (
    compensation: UpdateAffiliateCompensation | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const affiliateModuleService: AffiliateModuleService =
      container.resolve(AFFILIATE_MODULE)

    await affiliateModuleService.updateAffiliates(
      compensation as unknown as Parameters<
        AffiliateModuleService["updateAffiliates"]
      >[0],
    )
  },
)
