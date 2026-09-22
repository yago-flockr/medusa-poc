import { z } from "zod"

export const postAuthAffiliateEmailpassInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type PostAuthAffiliateEmailpassInput = z.infer<
  typeof postAuthAffiliateEmailpassInputSchema
>

export const postAuthAffiliateEmailpassResponseSchema = z.object({
  token: z.string(),
})

export type PostAuthAffiliateEmailpassResponse = z.infer<
  typeof postAuthAffiliateEmailpassResponseSchema
>
