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

export const getVendorsMeShopifyProductsResponseSchema = z.object({
  currency_code: z.string(),
  requested_query_cost: z.number().optional(),
  has_next_page: z.boolean(),
  products: z.array(pulledShopifyProductWithStatusSchema),
})

export type GetVendorsMeShopifyProductsResponse = z.infer<
  typeof getVendorsMeShopifyProductsResponseSchema
>

export const postVendorsMeShopifyProductsImportInputSchema = z.object({
  shopify_product_ids: z
    .array(z.string())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "shopify_product_ids must not contain duplicates",
    }),
})

export type PostVendorsMeShopifyProductsImportInput = z.infer<
  typeof postVendorsMeShopifyProductsImportInputSchema
>

export const postVendorsMeShopifyProductsImportResponseSchema = z.object({
  created_count: z.number(),
  updated_count: z.number(),
})

export type PostVendorsMeShopifyProductsImportResponse = z.infer<
  typeof postVendorsMeShopifyProductsImportResponseSchema
>
