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

// "placed" is the implicit starting state (no metadata set yet). Only
// "accepted" and "dispatched" are reachable through the vendor panel today —
// unfulfillable/in-production/return states are intentionally not modeled
// yet, scoped out of this first pass.
export const vendorConsignmentStatusSchema = z.enum([
  "placed",
  "accepted",
  "dispatched",
])

export type VendorConsignmentStatus = z.infer<
  typeof vendorConsignmentStatusSchema
>

export const vendorOrderAddressSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  address_1: z.string().nullable(),
  address_2: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  postal_code: z.string().nullable(),
  country_code: z.string().nullable(),
  phone: z.string().nullable(),
})

export type VendorOrderAddress = z.infer<typeof vendorOrderAddressSchema>

export const vendorOrderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  variant_title: z.string().nullable(),
  variant_sku: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
})

export type VendorOrderItem = z.infer<typeof vendorOrderItemSchema>

export const getVendorsOrdersByIdResponseSchema = z.object({
  id: z.string(),
  display_id: z.number(),
  status: z.string(),
  consignment_status: vendorConsignmentStatusSchema,
  total: z.number(),
  currency_code: z.string(),
  items: z.array(vendorOrderItemSchema),
  shipping_address: vendorOrderAddressSchema.nullable(),
})

export type GetVendorsOrdersByIdResponse = z.infer<
  typeof getVendorsOrdersByIdResponseSchema
>

export const postVendorsOrdersByIdAcceptInputSchema = z.object({}).strict()

export type PostVendorsOrdersByIdAcceptInput = z.infer<
  typeof postVendorsOrdersByIdAcceptInputSchema
>

export const postVendorsOrdersByIdDispatchInputSchema = z
  .object({
    tracking_number: z.string().trim().min(1, "Tracking number is required"),
    tracking_url: z.string().trim().optional(),
  })
  .strict()

export type PostVendorsOrdersByIdDispatchInput = z.infer<
  typeof postVendorsOrdersByIdDispatchInputSchema
>
