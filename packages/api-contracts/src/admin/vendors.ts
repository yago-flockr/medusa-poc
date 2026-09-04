import { z } from "zod"
import type { FindParams } from "@medusajs/types"
import { paginationMetaSchema } from "@dtc/api-contracts/common/pagination"
import {
  vendorIntegrationConnectionProviderSchema,
  vendorIntegrationConnectionSchema,
  type VendorIntegrationConnection,
} from "@dtc/api-contracts/vendor/integration-connection"

export {
  vendorIntegrationConnectionProviderSchema,
  vendorIntegrationConnectionSchema,
  type VendorIntegrationConnection,
}

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

export const vendorListResponseSchema = paginationMetaSchema.extend({
  vendors: z.array(vendorSchema),
})

export type VendorListResponse = z.infer<typeof vendorListResponseSchema>

export const vendorResponseSchema = z.object({
  vendor: vendorSchema,
})

export type VendorResponse = z.infer<typeof vendorResponseSchema>

export const vendorDeleteResponseSchema = z.object({
  id: z.string(),
  object: z.literal("vendor"),
  deleted: z.boolean(),
})

export type VendorDeleteResponse = z.infer<typeof vendorDeleteResponseSchema>

export const createVendorSchema = z
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

export type CreateVendor = z.infer<typeof createVendorSchema>

export const updateVendorIntegrationConnectionSchema = z
  .object({
    provider: vendorIntegrationConnectionProviderSchema,
    external_account_identifier: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
      })
      .optional()
      .transform((value) =>
        value
          ? value.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase()
          : value,
      ),
    client_id: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
      })
      .optional(),
    client_secret: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
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

export type UpdateVendorIntegrationConnection = z.infer<
  typeof updateVendorIntegrationConnectionSchema
>

export const updateVendorSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    handle: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
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
