import { z } from "zod"
import { paginationMetaSchema, paginationQuerySchema } from "../common/pagination"

export const vendorStockLocationAddressSchema = z.object({
  address_1: z.string(),
  address_2: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  postal_code: z.string().nullable(),
  country_code: z.string(),
  phone: z.string().nullable(),
})

export type VendorStockLocationAddress = z.infer<typeof vendorStockLocationAddressSchema>

export const vendorStockLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: vendorStockLocationAddressSchema.nullable(),
})

export type VendorStockLocation = z.infer<typeof vendorStockLocationSchema>

export const vendorStockLocationsQuerySchema = paginationQuerySchema

export type VendorStockLocationsQuery = z.infer<typeof vendorStockLocationsQuerySchema>

export const vendorStockLocationsListResponseSchema = paginationMetaSchema.extend({
  stock_locations: z.array(vendorStockLocationSchema),
})

export type VendorStockLocationsListResponse = z.infer<
  typeof vendorStockLocationsListResponseSchema
>

const createVendorStockLocationAddressSchema = z
  .object({
    address_1: z.string().trim().min(1, "Address is required"),
    address_2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    province: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
    country_code: z.string().trim().min(2).max(2, "Use a two-letter country code"),
    phone: z.string().trim().optional(),
  })
  .strict()

export const createVendorStockLocationSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    address: createVendorStockLocationAddressSchema.optional(),
  })
  .strict()

export type CreateVendorStockLocation = z.infer<typeof createVendorStockLocationSchema>

export const createVendorStockLocationResponseSchema = z.object({
  stock_location: vendorStockLocationSchema,
})

export type CreateVendorStockLocationResponse = z.infer<
  typeof createVendorStockLocationResponseSchema
>
