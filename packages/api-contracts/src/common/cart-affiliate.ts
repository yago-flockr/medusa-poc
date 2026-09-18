import { z } from "zod"

export const cartAffiliateAdditionalData = {
  affiliate_handle: z.string().nullish(),
}

export const cartAffiliateAdditionalDataSchema = z.object(
  cartAffiliateAdditionalData,
)

export type CartAffiliateAdditionalData = z.infer<
  typeof cartAffiliateAdditionalDataSchema
>
