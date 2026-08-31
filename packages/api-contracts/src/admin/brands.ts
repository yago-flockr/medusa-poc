import { z } from "zod"
import type { DeleteResponse, FindParams, PaginatedResponse } from "@medusajs/types"

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

export type BrandListResponse = PaginatedResponse<{ brands: Brand[] }>

export type BrandResponse = {
  brand: Brand
}

export type BrandDeleteResponse = DeleteResponse<"brand">

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
