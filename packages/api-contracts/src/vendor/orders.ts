import { z } from "zod"

export const vendorOrderSchema = z.object({
  id: z.string(),
  display_id: z.number(),
  status: z.string(),
  total: z.number(),
  currency_code: z.string(),
  items: z.array(
    z.object({ id: z.string(), title: z.string(), quantity: z.number() }),
  ),
})

export type VendorOrder = z.infer<typeof vendorOrderSchema>

export const vendorOrdersListResponseSchema = z.object({
  orders: z.array(vendorOrderSchema),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type VendorOrdersListResponse = z.infer<
  typeof vendorOrdersListResponseSchema
>

export const vendorOrdersQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type VendorOrdersQuery = z.infer<typeof vendorOrdersQuerySchema>
