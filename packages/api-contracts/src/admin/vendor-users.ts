import { z } from "zod"
import type { FindParams } from "@medusajs/types"
import { paginationMetaSchema } from "../common/pagination"

export const vendorUserSchema = z.object({
  id: z.string(),
  vendor_id: z.string(),
  vendor: z.object({ id: z.string(), name: z.string() }).optional(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type VendorUser = z.infer<typeof vendorUserSchema>

export const vendorUserListFiltersSchema = z.object({
  id: z.string().optional(),
  vendor_id: z.string().optional(),
  email: z.string().optional(),
})

export type VendorUserListQuery = FindParams &
  z.infer<typeof vendorUserListFiltersSchema>

export const vendorUserListResponseSchema = paginationMetaSchema.extend({
  vendor_users: z.array(vendorUserSchema),
})

export type VendorUserListResponse = z.infer<typeof vendorUserListResponseSchema>

export const vendorUserResponseSchema = z.object({
  vendor_user: vendorUserSchema,
})

export type VendorUserResponse = z.infer<typeof vendorUserResponseSchema>

export const vendorUserWithPasswordResponseSchema = z.object({
  vendor_user: vendorUserSchema,
  password: z.string(),
})

export type VendorUserWithPasswordResponse = z.infer<
  typeof vendorUserWithPasswordResponseSchema
>

export const regeneratePasswordResponseSchema = z.object({
  password: z.string(),
})

export type RegeneratePasswordResponse = z.infer<
  typeof regeneratePasswordResponseSchema
>

export const createVendorUserSchema = z
  .object({
    vendor_id: z.string().trim().min(1, "Vendor is required"),
    email: z.string().trim().pipe(z.email("A valid email is required")),
    first_name: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    last_name: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
  })
  .strict()

export type CreateVendorUser = z.infer<typeof createVendorUserSchema>

export const updateVendorUserSchema = z
  .object({
    first_name: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    last_name: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    is_active: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.first_name !== undefined ||
      data.last_name !== undefined ||
      data.is_active !== undefined,
    {
      message:
        "At least one of first name, last name, or is_active is required",
    },
  )

export type UpdateVendorUser = z.infer<typeof updateVendorUserSchema>
