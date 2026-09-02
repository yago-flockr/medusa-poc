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

export const getVendorsOrdersResponseSchema = paginationMetaSchema.extend({
  orders: z.array(vendorOrderSchema),
})

export type GetVendorsOrdersResponse = z.infer<
  typeof getVendorsOrdersResponseSchema
>

export const getVendorsOrdersInputSchema = paginationQuerySchema

export type GetVendorsOrdersInput = z.infer<typeof getVendorsOrdersInputSchema>
