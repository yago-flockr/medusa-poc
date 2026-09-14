import type { HttpTypes } from "@medusajs/framework/types"
import type { StorefrontContent } from "@dtc/api-contracts/common/storefront-content"

export type ProductCategory = HttpTypes.AdminProductCategory & {
  storefront_content?: StorefrontContent | null
}

export type ProductCategoryQuery = {
  fields?: string
}
