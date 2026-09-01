import { z } from "zod"
import type { FindParams } from "@medusajs/types"
import { paginationMetaSchema } from "../common/pagination"

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
})

export type Brand = z.infer<typeof brandSchema>

export const brandListFiltersSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
})

export type BrandListQuery = FindParams & z.infer<typeof brandListFiltersSchema>

export const brandListResponseSchema = paginationMetaSchema.extend({
  brands: z.array(brandSchema),
})

export type BrandListResponse = z.infer<typeof brandListResponseSchema>

export const brandResponseSchema = z.object({
  brand: brandSchema,
})

export type BrandResponse = z.infer<typeof brandResponseSchema>

export const brandDeleteResponseSchema = z.object({
  id: z.string(),
  object: z.literal("brand"),
  deleted: z.boolean(),
})

export type BrandDeleteResponse = z.infer<typeof brandDeleteResponseSchema>

export const createBrandSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    handle: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
  })
  .strict()

export type CreateBrand = z.infer<typeof createBrandSchema>

export const updateBrandSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    handle: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.handle !== undefined, {
    message: "At least one of name or handle is required",
  })

export type UpdateBrand = z.infer<typeof updateBrandSchema>
