import { z } from "zod"

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
