"use server"

import { sdk } from "@/store/lib/config"
import { StorefrontContent } from "@/store/lib/types/storefront-content"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export type StoreCollectionWithStorefrontContent = HttpTypes.StoreCollection & {
  storefront_content?: StorefrontContent
}

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      },
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {},
): Promise<{
  collections: StoreCollectionWithStorefrontContent[]
  count: number
}> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{
      collections: StoreCollectionWithStorefrontContent[]
      count: number
    }>("/store/collections", {
      query: queryParams,
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string,
): Promise<StoreCollectionWithStorefrontContent | null> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<{ collections: StoreCollectionWithStorefrontContent[] }>(
      `/store/collections`,
      {
        query: { handle, fields: "*products, +storefront_content.*" },
        next,
        cache: "force-cache",
      },
    )
    .then(({ collections }) => collections[0] || null)
}
