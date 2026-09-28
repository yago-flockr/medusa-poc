import { z } from "zod"
import { paginationMetaSchema } from "@dtc/api-contracts/common/pagination"

export const affiliateOrderSchema = z.object({
  id: z.string(),
  display_id: z.number(),
  currency_code: z.string(),
  units: z.number(),
  commission_total: z.number(),
})

export type AffiliateOrder = z.infer<typeof affiliateOrderSchema>

export const getAffiliatesOrdersResponseSchema = paginationMetaSchema.extend({
  orders: z.array(affiliateOrderSchema),
})

export type GetAffiliatesOrdersResponse = z.infer<
  typeof getAffiliatesOrdersResponseSchema
>

export const affiliateOrderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  variant_title: z.string().nullable(),
  variant_sku: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
})

export const getAffiliatesOrdersByIdResponseSchema = z.object({
  id: z.string(),
  display_id: z.number(),
  currency_code: z.string(),
  items: z.array(affiliateOrderItemSchema),
})

export type GetAffiliatesOrdersByIdResponse = z.infer<
  typeof getAffiliatesOrdersByIdResponseSchema
>
