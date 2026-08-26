import { z } from "zod"

export const vendorMeResponseSchema = z.object({
  vendor_user: z.object({
    id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email: z.string(),
  }),
  vendor: z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    shopify_store_domain: z.string().nullable(),
    shopify_client_id: z.string().nullable(),
    shopify_connected_at: z.string().nullable(),
    shopify_connected: z.boolean(),
  }),
})

export type VendorMeResponse = z.infer<typeof vendorMeResponseSchema>
