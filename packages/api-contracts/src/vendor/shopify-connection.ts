import { z } from "zod"
import { normalizeShopifyStoreDomain } from "@dtc/api-contracts/common/normalize-shopify-domain"

export const patchVendorsShopifyConnectionInputSchema = z.object({
  shopify_store_domain: z
    .string()
    .min(1)
    .trim()
    .transform(normalizeShopifyStoreDomain),
  shopify_client_id: z.string().min(1).trim(),
  shopify_client_secret: z.string().min(1).trim(),
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
