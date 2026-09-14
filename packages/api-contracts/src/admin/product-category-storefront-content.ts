import { z } from "zod"
import {
  storefrontContentSchema,
  updateStorefrontContentSchema,
} from "@dtc/api-contracts/common/storefront-content"

export const postAdminProductCategoriesByIdStorefrontContentInputSchema =
  updateStorefrontContentSchema

export type PostAdminProductCategoriesByIdStorefrontContentInput = z.infer<
  typeof postAdminProductCategoriesByIdStorefrontContentInputSchema
>

export const postAdminProductCategoriesByIdStorefrontContentResponseSchema =
  z.object({
    storefront_content: storefrontContentSchema,
  })

export type PostAdminProductCategoriesByIdStorefrontContentResponse = z.infer<
  typeof postAdminProductCategoriesByIdStorefrontContentResponseSchema
>
