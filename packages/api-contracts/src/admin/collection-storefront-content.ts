import { z } from "zod"
import {
  storefrontContentSchema,
  updateStorefrontContentSchema,
} from "@dtc/api-contracts/common/storefront-content"

export const postAdminCollectionsByIdStorefrontContentInputSchema =
  updateStorefrontContentSchema

export type PostAdminCollectionsByIdStorefrontContentInput = z.infer<
  typeof postAdminCollectionsByIdStorefrontContentInputSchema
>

export const postAdminCollectionsByIdStorefrontContentResponseSchema = z.object(
  {
    storefront_content: storefrontContentSchema,
  },
)

export type PostAdminCollectionsByIdStorefrontContentResponse = z.infer<
  typeof postAdminCollectionsByIdStorefrontContentResponseSchema
>
