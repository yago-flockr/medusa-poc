import { z } from "zod"
import { shopifyPulledProductSchema } from "../vendor/shopify-products"

export const generateVendorShopifyInstallLinkResponseSchema = z.object({
  install_link: z.string(),
})

export type GenerateVendorShopifyInstallLinkResponse = z.infer<
  typeof generateVendorShopifyInstallLinkResponseSchema
>

export const pullVendorShopifyProductsResponseSchema = z.object({
  currency_code: z.string(),
  requested_query_cost: z.number().optional(),
  has_next_page: z.boolean(),
  products: z.array(shopifyPulledProductSchema),
})

export type PullVendorShopifyProductsResponse = z.infer<
  typeof pullVendorShopifyProductsResponseSchema
>
