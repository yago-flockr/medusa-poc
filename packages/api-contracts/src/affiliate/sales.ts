import { z } from "zod"

export const affiliateSalesTotalsSchema = z.object({
  orders: z.number(),
  units_sold: z.number(),
  revenue: z.number(),
  commission_total: z.number(),
})

export type AffiliateSalesTotals = z.infer<typeof affiliateSalesTotalsSchema>

export const getAffiliatesSalesResponseSchema = z.object({
  totals: affiliateSalesTotalsSchema,
})

export type GetAffiliatesSalesResponse = z.infer<
  typeof getAffiliatesSalesResponseSchema
>
