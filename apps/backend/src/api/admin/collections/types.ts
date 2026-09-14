import type { HttpTypes } from "@medusajs/framework/types"
import type { StorefrontContent } from "@dtc/api-contracts/common/storefront-content"

export type Collection = HttpTypes.AdminCollection & {
  storefront_content?: StorefrontContent | null
}

export type CollectionQuery = {
  fields?: string
}
