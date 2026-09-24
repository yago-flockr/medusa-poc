"use server"

import { sdk } from "@/store/lib/config"
import { StorefrontContent } from "@/store/lib/types/storefront-content"
import { getCacheOptions } from "./cookies"

export type StoreAffiliate = {
  id: string
  name: string
  handle: string
  storefront_content?: StorefrontContent | null
}

export type StoreAffiliateWithProducts = StoreAffiliate & {
  products?: { id: string }[]
}

export const listAffiliates = async (
  queryParams: Record<string, string> = {},
): Promise<{ affiliates: StoreAffiliate[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("affiliates")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{
      affiliates: StoreAffiliate[]
      count: number
    }>("/store/affiliates", { query: queryParams, next, cache: "force-cache" })
    .then(({ affiliates, count }) => ({ affiliates, count }))
}

export const getAffiliateByHandle = async (
  handle: string,
): Promise<StoreAffiliateWithProducts | null> => {
  const next = {
    ...(await getCacheOptions("affiliates")),
  }

  return await sdk.client
    .fetch<{ affiliates: StoreAffiliateWithProducts[] }>("/store/affiliates", {
      query: { handle, fields: "+products.id" },
      next,
      cache: "force-cache",
    })
    .then(({ affiliates }) => affiliates[0] || null)
}
