"use server"

import { sdk } from "@/store/lib/config"
import { StorefrontContent } from "@/store/lib/types/storefront-content"
import { getCacheOptions } from "./cookies"

export type StoreVendor = {
  id: string
  name: string
  handle: string
  storefront_content?: StorefrontContent | null
}

export type StoreVendorWithProducts = StoreVendor & {
  products?: { id: string }[]
}

export const listVendors = async (
  queryParams: Record<string, string> = {},
): Promise<{ vendors: StoreVendor[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("vendors")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ vendors: StoreVendor[]; count: number }>("/store/vendors", {
      query: queryParams,
      next,
      cache: "force-cache",
    })
    .then(({ vendors, count }) => ({ vendors, count }))
}

export const getVendorByHandle = async (
  handle: string,
): Promise<StoreVendorWithProducts | null> => {
  const next = {
    ...(await getCacheOptions("vendors")),
  }

  return await sdk.client
    .fetch<{ vendors: StoreVendorWithProducts[] }>("/store/vendors", {
      query: { handle, fields: "+products.id" },
      next,
      cache: "force-cache",
    })
    .then(({ vendors }) => vendors[0] || null)
}
