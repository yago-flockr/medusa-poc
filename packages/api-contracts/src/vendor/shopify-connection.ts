import { z } from "zod"

export const setVendorShopifyConnectionSchema = z.object({
  shopify_store_domain: z.string().min(1),
  shopify_client_id: z.string().min(1),
  shopify_client_secret: z.string().min(1),
})

export type SetVendorShopifyConnectionInput = z.infer<
  typeof setVendorShopifyConnectionSchema
>

export const setVendorShopifyConnectionResponseSchema = z.object({
  vendor: z.object({
    id: z.string(),
    shopify_store_domain: z.string().nullable(),
  }),
})

export type SetVendorShopifyConnectionResponse = z.infer<
  typeof setVendorShopifyConnectionResponseSchema
>

export const getVendorShopifyInstallLinkResponseSchema = z.object({
  install_link: z.string(),
})

export type GetVendorShopifyInstallLinkResponse = z.infer<
  typeof getVendorShopifyInstallLinkResponseSchema
>
