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

export const vendorIntegrationConnectionSchema = z.object({
  provider: z.string(),
  external_account_identifier: z.string().nullable(),
  client_id: z.string().nullable(),
  connected: z.boolean(),
})

export type VendorIntegrationConnection = z.infer<
  typeof vendorIntegrationConnectionSchema
>

export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  users: z.array(vendorUserSchema).optional(),
  integration_connections: z.array(vendorIntegrationConnectionSchema).optional(),
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
const externalAccountIdentifier = optionalTrimmedStringOrNull().transform((value) =>
  value ? value.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() : value,
)
const connectionClientId = optionalTrimmedStringOrNull()

export const createVendorSchema = z
  .object({
    name,
    handle,
  })
  .strict()

export type CreateVendor = z.infer<typeof createVendorSchema>

export const updateVendorIntegrationConnectionSchema = z
  .object({
    provider: z.literal("shopify"),
    external_account_identifier: externalAccountIdentifier,
    client_id: connectionClientId,
    client_secret: optionalTrimmedString(),
  })
  .refine(
    (data) =>
      data.external_account_identifier !== undefined ||
      data.client_id !== undefined ||
      data.client_secret !== undefined,
    {
      message:
        "At least one of external_account_identifier, client_id, or client_secret is required",
    },
  )

export const updateVendorSchema = z
  .object({
    name: name.optional(),
    handle,
    is_active: z.boolean().optional(),
    integration_connection: updateVendorIntegrationConnectionSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.handle !== undefined ||
      data.is_active !== undefined ||
      data.integration_connection !== undefined,
    {
      message:
        "At least one of name, handle, is_active, or integration_connection is required",
    },
  )

export type UpdateVendor = z.infer<typeof updateVendorSchema>
