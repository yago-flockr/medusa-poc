import { z } from "zod"
import { paginationMetaSchema, paginationQuerySchema } from "@dtc/api-contracts/common/pagination"

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

export const getVendorsProductsInputSchema = paginationQuerySchema

export type GetVendorsProductsInput = z.infer<
  typeof getVendorsProductsInputSchema
>

export const getVendorsProductsResponseSchema = paginationMetaSchema.extend({
  products: z.array(vendorProductSchema),
})

export type GetVendorsProductsResponse = z.infer<
  typeof getVendorsProductsResponseSchema
>

export const deleteVendorsProductsByIdResponseSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
})

export type DeleteVendorsProductsByIdResponse = z.infer<
  typeof deleteVendorsProductsByIdResponseSchema
>

export const postVendorsProductsOptionInputSchema = z
  .object({
    title: z.string().trim().min(1),
    values: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .strict()

export type PostVendorsProductsOptionInput = z.infer<
  typeof postVendorsProductsOptionInputSchema
>

export const postVendorsProductsOptionsInputSchema = z
  .array(postVendorsProductsOptionInputSchema)
  .max(5)
  .optional()

export type PostVendorsProductsOptionsInput = z.infer<
  typeof postVendorsProductsOptionsInputSchema
>

export const postVendorsProductsImageInputSchema = z
  .object({ url: z.url() })
  .strict()

export type PostVendorsProductsImageInput = z.infer<
  typeof postVendorsProductsImageInputSchema
>

export const postVendorsProductsImagesInputSchema = z
  .array(postVendorsProductsImageInputSchema)
  .max(5)
  .optional()

export type PostVendorsProductsImagesInput = z.infer<
  typeof postVendorsProductsImagesInputSchema
>

export const postVendorsProductsVariantInputSchema = z
  .object({
    optionValues: z.record(z.string(), z.string()),
    price: z.number().positive("Price must be greater than 0"),
    sku: z.string().trim().min(1).optional(),
    weight: z.number().positive().optional(),
    barcode: z.string().trim().min(1).optional(),
    length: z.number().positive().optional(),
    height: z.number().positive().optional(),
    width: z.number().positive().optional(),
  })
  .strict()

export type PostVendorsProductsVariantInput = z.infer<
  typeof postVendorsProductsVariantInputSchema
>

export const postVendorsProductsVariantsInputSchema = z
  .array(postVendorsProductsVariantInputSchema)
  .min(1)
  .max(50)

export type PostVendorsProductsVariantsInput = z.infer<
  typeof postVendorsProductsVariantsInputSchema
>

export const postVendorsProductsInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    subtitle: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    handle: z.string().trim().min(1).optional(),
    images: postVendorsProductsImagesInputSchema,
    options: postVendorsProductsOptionsInputSchema,
    variants: postVendorsProductsVariantsInputSchema,
  })
  .strict()

export type PostVendorsProductsInput = z.infer<
  typeof postVendorsProductsInputSchema
>

export const postVendorsProductsResponseSchema = z.object({
  product: vendorProductSchema,
})

export type PostVendorsProductsResponse = z.infer<
  typeof postVendorsProductsResponseSchema
>

export const postVendorsProductsByIdVariantInputSchema = z
  .object({
    id: z.string(),
    price: z.number().positive("Price must be greater than 0").optional(),
    sku: z.string().trim().min(1).optional(),
    weight: z.number().positive().optional(),
  })
  .strict()

export type PostVendorsProductsByIdVariantInput = z.infer<
  typeof postVendorsProductsByIdVariantInputSchema
>

export const postVendorsProductsByIdInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    subtitle: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    handle: z.string().trim().min(1).optional(),
    images: postVendorsProductsImagesInputSchema,
    status: vendorProductStatusSchema.optional(),
    variants: z.array(postVendorsProductsByIdVariantInputSchema).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type PostVendorsProductsByIdInput = z.infer<
  typeof postVendorsProductsByIdInputSchema
>

export const vendorProductOptionDetailSchema = z.object({
  title: z.string(),
  values: z.array(z.string()),
})

export type VendorProductOptionDetail = z.infer<
  typeof vendorProductOptionDetailSchema
>

export const vendorProductVariantDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
  weight: z.number().nullable(),
  price: z.number().nullable(),
  optionValues: z.record(z.string(), z.string()),
})

export type VendorProductVariantDetail = z.infer<
  typeof vendorProductVariantDetailSchema
>

export const vendorProductDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  handle: z.string().nullable(),
  status: vendorProductStatusSchema,
  thumbnail: z.string().nullable(),
  external_id: z.string().nullable(),
  images: z.array(z.string()),
  options: z.array(vendorProductOptionDetailSchema),
  variants: z.array(vendorProductVariantDetailSchema),
})

export type VendorProductDetail = z.infer<typeof vendorProductDetailSchema>

export const getVendorsProductsByIdResponseSchema = z.object({
  product: vendorProductDetailSchema,
})

export type GetVendorsProductsByIdResponse = z.infer<
  typeof getVendorsProductsByIdResponseSchema
>
