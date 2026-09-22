import { z } from "zod"

export const affiliateProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  thumbnail: z.string().nullable(),
})

export type AffiliateProduct = z.infer<typeof affiliateProductSchema>

export const getAffiliatesProductsResponseSchema = z.object({
  products: z.array(affiliateProductSchema),
})

export type GetAffiliatesProductsResponse = z.infer<
  typeof getAffiliatesProductsResponseSchema
>

export const postAffiliatesProductsInputSchema = z
  .object({
    product_id: z.string().min(1, "Product is required"),
  })
  .strict()

export type PostAffiliatesProductsInput = z.infer<
  typeof postAffiliatesProductsInputSchema
>

export const deleteAffiliatesProductResponseSchema = z.object({
  id: z.string(),
  object: z.literal("affiliate_product"),
  deleted: z.boolean(),
})

export type DeleteAffiliatesProductResponse = z.infer<
  typeof deleteAffiliatesProductResponseSchema
>
