import { z } from "@medusajs/framework/zod"

export const affiliateAdditionalData = {
  referral_code: z.string().nullish(),
}

const affiliateAdditionalDataSchema = z.object(affiliateAdditionalData)

export type AffiliateAdditionalData = z.infer<
  typeof affiliateAdditionalDataSchema
>
