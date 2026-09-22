import { z } from "zod"

export const affiliateMeSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  email: z.string(),
  commission_rate: z.number(),
  is_active: z.boolean(),
})

export type AffiliateMe = z.infer<typeof affiliateMeSchema>

export const getAffiliatesMeResponseSchema = z.object({
  affiliate: affiliateMeSchema,
})

export type GetAffiliatesMeResponse = z.infer<
  typeof getAffiliatesMeResponseSchema
>
