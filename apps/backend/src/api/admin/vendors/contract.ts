import { z } from "@medusajs/framework/zod"
import type { FindParams, PaginatedResponse } from "@medusajs/framework/types"
import {
  optionalTrimmedString,
  optionalTrimmedStringOrNull,
  requiredTrimmedString,
} from "../zod-helpers"

export const vendorUserSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
})

export type VendorUser = z.infer<typeof vendorUserSchema>

export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  is_active: z.boolean(),
  shopify_store_domain: z.string().nullable(),
  shopify_client_id: z.string().nullable(),
  shopify_connected_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  users: z.array(vendorUserSchema).optional(),
})

export type Vendor = z.infer<typeof vendorSchema>

export const vendorListFiltersSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
})

export type VendorListQuery = FindParams &
  z.infer<typeof vendorListFiltersSchema>

export type VendorListResponse = PaginatedResponse<{ vendors: Vendor[] }>

export type VendorResponse = {
  vendor: Vendor
}

const name = requiredTrimmedString("Name is required")
const handle = optionalTrimmedString()
const shopifyStoreDomain = optionalTrimmedStringOrNull().transform((value) =>
  value ? value.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() : value,
)
const shopifyClientId = optionalTrimmedStringOrNull()

export const createVendorSchema = z
  .object({
    name,
    handle,
  })
  .strict()

export type CreateVendor = z.infer<typeof createVendorSchema>

export const updateVendorSchema = z
  .object({
    name: name.optional(),
    handle,
    is_active: z.boolean().optional(),
    shopify_store_domain: shopifyStoreDomain,
    shopify_client_id: shopifyClientId,
    shopify_client_secret: optionalTrimmedString(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.handle !== undefined ||
      data.is_active !== undefined ||
      data.shopify_store_domain !== undefined ||
      data.shopify_client_id !== undefined ||
      data.shopify_client_secret !== undefined,
    {
      message:
        "At least one of name, handle, is_active, shopify_store_domain, shopify_client_id, or shopify_client_secret is required",
    },
  )

export type UpdateVendor = z.infer<typeof updateVendorSchema>
