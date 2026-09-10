import { z } from "zod"

export const vendorProductCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
})

export type VendorProductCategory = z.infer<typeof vendorProductCategorySchema>

export const getVendorsProductCategoriesResponseSchema = z.object({
  product_categories: z.array(vendorProductCategorySchema),
})

export type GetVendorsProductCategoriesResponse = z.infer<
  typeof getVendorsProductCategoriesResponseSchema
>
