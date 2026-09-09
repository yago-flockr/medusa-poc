import { z } from "zod"

export const patchVendorsShopifyConnectionInputSchema = z.object({
  shopify_store_domain: z.string().min(1),
  shopify_client_id: z.string().min(1),
  shopify_client_secret: z.string().min(1),
})

export type PatchVendorsShopifyConnectionInput = z.infer<
  typeof patchVendorsShopifyConnectionInputSchema
>

export const patchVendorsShopifyConnectionResponseSchema = z.object({
  vendor: z.object({
    id: z.string(),
    shopify_store_domain: z.string().nullable(),
  }),
})

export type PatchVendorsShopifyConnectionResponse = z.infer<
  typeof patchVendorsShopifyConnectionResponseSchema
>

export const getVendorsShopifyConnectionInstallLinkResponseSchema = z.object({
  install_link: z.string(),
})

export type GetVendorsShopifyConnectionInstallLinkResponse = z.infer<
  typeof getVendorsShopifyConnectionInstallLinkResponseSchema
>
