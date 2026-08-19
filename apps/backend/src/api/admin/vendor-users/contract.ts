import type { FindParams, PaginatedResponse } from "@medusajs/framework/types"
import { z } from "@medusajs/framework/zod"
import { optionalTrimmedString, requiredTrimmedString } from "../zod-helpers"

export const vendorUserSchema = z.object({
  id: z.string(),
  vendor_id: z.string(),
  vendor: z.object({ id: z.string(), name: z.string() }).optional(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
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

export type VendorUserListResponse = PaginatedResponse<{
  vendor_users: VendorUser[]
}>

export type VendorUserResponse = {
  vendor_user: VendorUser
}

export type VendorUserWithPasswordResponse = {
  vendor_user: VendorUser
  password: string
}

export type RegeneratePasswordResponse = {
  password: string
}

const optionalNamePart = optionalTrimmedString()

export const createVendorUserSchema = z
  .object({
    vendor_id: requiredTrimmedString("Vendor is required"),
    email: z.string().trim().email("A valid email is required"),
    first_name: optionalNamePart,
    last_name: optionalNamePart,
  })
  .strict()

export type CreateVendorUser = z.infer<typeof createVendorUserSchema>

export const updateVendorUserSchema = z
  .object({
    first_name: optionalNamePart,
    last_name: optionalNamePart,
  })
  .strict()
  .refine(
    (data) => data.first_name !== undefined || data.last_name !== undefined,
    { message: "At least one of first name or last name is required" },
  )

export type UpdateVendorUser = z.infer<typeof updateVendorUserSchema>
