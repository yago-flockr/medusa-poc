import { z } from "zod"

export const vendorProductStatusSchema = z.enum([
  "draft",
  "proposed",
  "published",
  "rejected",
])

export type VendorProductStatus = z.infer<typeof vendorProductStatusSchema>

export const vendorProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string().nullable(),
  status: vendorProductStatusSchema,
  thumbnail: z.string().nullable(),
  external_id: z.string().nullable(),
  variant_count: z.number(),
})

export type VendorProduct = z.infer<typeof vendorProductSchema>

export const vendorProductsQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type VendorProductsQuery = z.infer<typeof vendorProductsQuerySchema>

export const vendorProductsListResponseSchema = z.object({
  products: z.array(vendorProductSchema),
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type VendorProductsListResponse = z.infer<
  typeof vendorProductsListResponseSchema
>

export const updateVendorProductStatusSchema = z.object({
  status: vendorProductStatusSchema,
})

export type UpdateVendorProductStatusInput = z.infer<
  typeof updateVendorProductStatusSchema
>

export const updateVendorProductStatusResponseSchema = z.object({
  product: z.object({ id: z.string(), status: vendorProductStatusSchema }),
})

export type UpdateVendorProductStatusResponse = z.infer<
  typeof updateVendorProductStatusResponseSchema
>

export const deleteVendorProductResponseSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
})

export type DeleteVendorProductResponse = z.infer<
  typeof deleteVendorProductResponseSchema
>
