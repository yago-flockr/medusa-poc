import { sdk } from "@/store/lib/config"
import { StorefrontContent } from "@/store/lib/types/storefront-content"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export type StoreProductCategoryWithStorefrontContent =
  HttpTypes.StoreProductCategory & {
    storefront_content?: StorefrontContent
  }

export const listCategories = async (
  query?: Record<string, unknown>,
): Promise<StoreProductCategoryWithStorefrontContent[]> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{
      product_categories: StoreProductCategoryWithStorefrontContent[]
    }>("/store/product-categories", {
      query: {
        fields:
          "*category_children, *products, *parent_category, *parent_category.parent_category",
        limit,
        ...query,
      },
      next,
      cache: "force-cache",
    })
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (
  categoryHandle: string[],
): Promise<StoreProductCategoryWithStorefrontContent> => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{
      product_categories: StoreProductCategoryWithStorefrontContent[]
    }>(`/store/product-categories`, {
      query: {
        fields: "*category_children, *products, +storefront_content.*",
        handle,
      },
      next,
      cache: "force-cache",
    })
    .then(({ product_categories }) => product_categories[0])
}
