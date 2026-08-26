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

export const pullVendorShopifyProductsResponseSchema = z.object({
  currencyCode: z.string(),
  requestedQueryCost: z.number().optional(),
  hasNextPage: z.boolean(),
  products: z.array(shopifyPulledProductSchema),
})

export type PullVendorShopifyProductsResponse = z.infer<
  typeof pullVendorShopifyProductsResponseSchema
>
