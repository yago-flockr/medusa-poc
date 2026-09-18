import { z } from "zod"

export const AFFILIATE_HANDLE_MAX_LENGTH = 64

export const cartAffiliateAdditionalData = {
  affiliate_handle: z.string().max(AFFILIATE_HANDLE_MAX_LENGTH).nullish(),
}

export const cartAffiliateAdditionalDataSchema = z.object(
  cartAffiliateAdditionalData,
)

export type CartAffiliateAdditionalData = z.infer<
  typeof cartAffiliateAdditionalDataSchema
>
