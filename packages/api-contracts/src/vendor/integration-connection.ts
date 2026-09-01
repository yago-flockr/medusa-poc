import { z } from "zod"

// Every provider a vendor's catalogue can connect to — Shopify today, more
// later (e.g. WooCommerce). Adding one is a single addition here; every
// schema and UI built on this file follows without further changes.
export const vendorIntegrationConnectionProviderSchema = z.enum(["shopify"])

export type VendorIntegrationConnectionProvider = z.infer<
  typeof vendorIntegrationConnectionProviderSchema
>

export const vendorIntegrationConnectionSchema = z.object({
  provider: vendorIntegrationConnectionProviderSchema,
  external_account_identifier: z.string().nullable(),
  client_id: z.string().nullable(),
  connected: z.boolean(),
})

export type VendorIntegrationConnection = z.infer<
  typeof vendorIntegrationConnectionSchema
>
