import { z } from "zod"
import { paginationMetaSchema, paginationQuerySchema } from "../common/pagination"

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

export const vendorOrdersListResponseSchema = paginationMetaSchema.extend({
  orders: z.array(vendorOrderSchema),
})

export type VendorOrdersListResponse = z.infer<
  typeof vendorOrdersListResponseSchema
>

export const vendorOrdersQuerySchema = paginationQuerySchema

export type VendorOrdersQuery = z.infer<typeof vendorOrdersQuerySchema>
