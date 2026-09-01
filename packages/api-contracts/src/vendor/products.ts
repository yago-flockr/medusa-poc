import { z } from "zod"
import { paginationMetaSchema, paginationQuerySchema } from "../common/pagination"

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

export const vendorProductsQuerySchema = paginationQuerySchema

export type VendorProductsQuery = z.infer<typeof vendorProductsQuerySchema>

export const vendorProductsListResponseSchema = paginationMetaSchema.extend({
  products: z.array(vendorProductSchema),
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

export const vendorProductOptionSchema = z
  .object({
    title: z.string().trim().min(1),
    values: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .strict()

export type VendorProductOptionInput = z.infer<typeof vendorProductOptionSchema>

export const vendorProductOptionsSchema = z
  .array(vendorProductOptionSchema)
  .max(5)
  .optional()

export type VendorProductOptionsInput = z.infer<typeof vendorProductOptionsSchema>

export const vendorProductImageSchema = z
  .object({ url: z.url() })
  .strict()

export type VendorProductImageInput = z.infer<typeof vendorProductImageSchema>

export const vendorProductImagesSchema = z
  .array(vendorProductImageSchema)
  .max(5)
  .optional()

export type VendorProductImagesInput = z.infer<typeof vendorProductImagesSchema>

export const vendorProductVariantSchema = z
  .object({
    optionValues: z.record(z.string(), z.string()),
    price: z.number().positive("Price must be greater than 0"),
    sku: z.string().trim().min(1).optional(),
    barcode: z.string().trim().min(1).optional(),
    weight: z.number().positive().optional(),
    length: z.number().positive().optional(),
    height: z.number().positive().optional(),
    width: z.number().positive().optional(),
  })
  .strict()

export type VendorProductVariantInput = z.infer<typeof vendorProductVariantSchema>

export const vendorProductVariantsSchema = z
  .array(vendorProductVariantSchema)
  .min(1)
  .max(50)

export type VendorProductVariantsInput = z.infer<typeof vendorProductVariantsSchema>

export const createVendorProductSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    subtitle: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    handle: z.string().trim().min(1).optional(),
    images: vendorProductImagesSchema,
    options: vendorProductOptionsSchema,
    variants: vendorProductVariantsSchema,
  })
  .strict()

export type CreateVendorProduct = z.infer<typeof createVendorProductSchema>

export const createVendorProductResponseSchema = z.object({
  product: vendorProductSchema,
})

export type CreateVendorProductResponse = z.infer<
  typeof createVendorProductResponseSchema
>

export const updateVendorProductSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    subtitle: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    handle: z.string().trim().min(1).optional(),
    images: vendorProductImagesSchema,
    status: vendorProductStatusSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type UpdateVendorProduct = z.infer<typeof updateVendorProductSchema>
