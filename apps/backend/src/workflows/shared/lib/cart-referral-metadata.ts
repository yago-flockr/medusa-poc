import { z } from "@medusajs/framework/zod"

const cartReferralMetadataSchema = z.object({
  referral_code: z.string().min(1),
})

export type CartReferralMetadata = z.infer<typeof cartReferralMetadataSchema>

export function cartReferralMetadata(
  referralCode: string,
): CartReferralMetadata {
  return { referral_code: referralCode }
}

export function readCartReferralCode(metadata: unknown): string | null {
  const parsed = cartReferralMetadataSchema.safeParse(metadata)

  return parsed.success ? parsed.data.referral_code : null
}
