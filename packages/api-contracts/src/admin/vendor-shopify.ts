import { z } from "zod"
import { shopifyPulledProductSchema } from "../vendor/shopify-products"

// Admin's own actions on a vendor's Shopify connection — staff acting on a
// vendor by id, not the vendor acting on their own connection. Kept
// separate from the vendor-facing schemas in `vendor/shopify-*.ts` even
// though a shape here may coincide with one there today: each belongs to
// its own endpoint/hook and is free to diverge (e.g. this pull response
// has no `already_imported` — only the vendor's own import-browsing flow
// computes that).

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
