import { z } from "zod"

export const affiliateProductSalesSchema = z.object({
  product_id: z.string(),
  product_title: z.string().nullable(),
  product_handle: z.string().nullable(),
  units_sold: z.number(),
  units_returned: z.number(),
  revenue: z.number(),
  orders: z.number(),
})

export type AffiliateProductSales = z.infer<typeof affiliateProductSalesSchema>

export const getAffiliatesSalesResponseSchema = z.object({
  product_sales: z.array(affiliateProductSalesSchema),
})

export type GetAffiliatesSalesResponse = z.infer<
  typeof getAffiliatesSalesResponseSchema
>
