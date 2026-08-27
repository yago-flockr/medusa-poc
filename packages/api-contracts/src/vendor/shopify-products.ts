import { z } from "zod"

export const shopifyPulledProductSchema = z.object({
  shopify_id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string(),
  status: z.string(),
  options: z.array(
    z.object({ name: z.string(), values: z.array(z.string()) }),
  ),
  image_urls: z.array(z.string()),
  variants: z.array(
    z.object({
      title: z.string(),
      sku: z.string().nullable(),
      price: z.string(),
      inventoryQuantity: z.number().nullable(),
      options: z.array(z.object({ name: z.string(), value: z.string() })),
    }),
  ),
  collections: z.array(z.string()),
})

export type ShopifyPulledProduct = z.infer<typeof shopifyPulledProductSchema>

export const pulledShopifyProductWithStatusSchema = shopifyPulledProductSchema.extend({
  already_imported: z.boolean(),
})

export type PulledShopifyProductWithStatus = z.infer<
  typeof pulledShopifyProductWithStatusSchema
>

export const pullVendorShopifyProductsResponseSchema = z.object({
  currencyCode: z.string(),
  requestedQueryCost: z.number().optional(),
  hasNextPage: z.boolean(),
  products: z.array(pulledShopifyProductWithStatusSchema),
})

export type PullVendorShopifyProductsResponse = z.infer<
  typeof pullVendorShopifyProductsResponseSchema
>

export const importVendorShopifyProductsSchema = z.object({
  shopify_product_ids: z.array(z.string()).min(1),
})

export type ImportVendorShopifyProductsInput = z.infer<
  typeof importVendorShopifyProductsSchema
>

export const importVendorShopifyProductsResponseSchema = z.object({
  created_count: z.number(),
  updated_count: z.number(),
})

export type ImportVendorShopifyProductsResponse = z.infer<
  typeof importVendorShopifyProductsResponseSchema
>
