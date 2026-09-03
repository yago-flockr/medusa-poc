import { z } from "zod"
import { paginationMetaSchema, paginationQuerySchema } from "@dtc/api-contracts/common/pagination"

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

export const getVendorsStockLocationsInputSchema = paginationQuerySchema

export type GetVendorsStockLocationsInput = z.infer<
  typeof getVendorsStockLocationsInputSchema
>

export const getVendorsStockLocationsResponseSchema = paginationMetaSchema.extend({
  stock_locations: z.array(vendorStockLocationSchema),
})

export type GetVendorsStockLocationsResponse = z.infer<
  typeof getVendorsStockLocationsResponseSchema
>

export const postVendorsStockLocationsAddressInputSchema = z
  .object({
    address_1: z.string().trim().min(1, "Address is required"),
    address_2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    province: z.string().trim().min(1, "Province is required"),
    postal_code: z.string().trim().min(1, "Postal code is required"),
    country_code: z.string().trim().min(2).max(2, "Use a two-letter country code"),
    phone: z.string().trim().optional(),
  })
  .strict()

export type PostVendorsStockLocationsAddressInput = z.infer<
  typeof postVendorsStockLocationsAddressInputSchema
>

export const postVendorsStockLocationsInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    address: postVendorsStockLocationsAddressInputSchema,
  })
  .strict()

export type PostVendorsStockLocationsInput = z.infer<
  typeof postVendorsStockLocationsInputSchema
>

export const postVendorsStockLocationsResponseSchema = z.object({
  stock_location: vendorStockLocationSchema,
})

export type PostVendorsStockLocationsResponse = z.infer<
  typeof postVendorsStockLocationsResponseSchema
>

export const postVendorsStockLocationsByIdInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    address: postVendorsStockLocationsAddressInputSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type PostVendorsStockLocationsByIdInput = z.infer<
  typeof postVendorsStockLocationsByIdInputSchema
>

export const deleteVendorsStockLocationsByIdResponseSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
})

export type DeleteVendorsStockLocationsByIdResponse = z.infer<
  typeof deleteVendorsStockLocationsByIdResponseSchema
>
