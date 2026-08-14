import { z } from "@medusajs/framework/zod"
import type {
  DeleteResponse,
  FindParams,
  PaginatedResponse,
} from "@medusajs/framework/types"

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

export type BrandListQuery = FindParams &
  z.infer<typeof brandListFiltersSchema>

export type BrandListResponse = PaginatedResponse<{ brands: Brand[] }>

export type BrandResponse = {
  brand: Brand
}

export type BrandDeleteResponse = DeleteResponse<"brand">

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const name = z.string().trim().min(1, "Name is required")
const handle = z.preprocess(
  emptyToUndefined,
  z.string().min(1, "Handle is required").optional()
)

export const createBrandSchema = z
  .object({
    name,
    handle,
  })
  .strict()

export type CreateBrand = z.infer<typeof createBrandSchema>

export const updateBrandSchema = z
  .object({
    name: name.optional(),
    handle,
  })
  .strict()
  .refine((data) => data.name !== undefined || data.handle !== undefined, {
    message: "At least one of name or handle is required",
  })

export type UpdateBrand = z.infer<typeof updateBrandSchema>
