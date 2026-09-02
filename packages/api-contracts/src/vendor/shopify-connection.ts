import { z } from "zod"

export const patchVendorsMeShopifyConnectionInputSchema = z.object({
  shopify_store_domain: z.string().min(1),
  shopify_client_id: z.string().min(1),
  shopify_client_secret: z.string().min(1),
})

export type PatchVendorsMeShopifyConnectionInput = z.infer<
  typeof patchVendorsMeShopifyConnectionInputSchema
>

export const patchVendorsMeShopifyConnectionResponseSchema = z.object({
  vendor: z.object({
    id: z.string(),
    shopify_store_domain: z.string().nullable(),
  }),
})

export type PatchVendorsMeShopifyConnectionResponse = z.infer<
  typeof patchVendorsMeShopifyConnectionResponseSchema
>

export const getVendorsMeShopifyConnectionInstallLinkResponseSchema = z.object({
  install_link: z.string(),
})

export type GetVendorsMeShopifyConnectionInstallLinkResponse = z.infer<
  typeof getVendorsMeShopifyConnectionInstallLinkResponseSchema
>
