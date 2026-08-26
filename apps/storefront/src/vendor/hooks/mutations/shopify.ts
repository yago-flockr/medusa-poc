import { request } from "@/vendor/lib/client"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export type SetVendorShopifyConnectionInput = {
  shopify_store_domain: string
  shopify_client_id: string
  shopify_client_secret: string
}

export const useSetVendorShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.setConnection,
    mutationFn: (input: SetVendorShopifyConnectionInput) =>
      request<{ vendor: { id: string; shopify_store_domain: string | null } }>(
        "/vendors/me/shopify-connection",
        { method: "PATCH", body: input },
      ),
  })

export const useGetVendorShopifyInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getInstallLink,
    mutationFn: () =>
      request<{ installLink: string }>(
        "/vendors/me/shopify-connection/install-link",
      ),
  })

export type ShopifyPulledProduct = {
  shopify_id: string
  title: string
  handle: string
  description: string
  status: string
  options: { name: string; values: string[] }[]
  image_urls: string[]
  variants: {
    title: string
    sku: string | null
    price: string
    inventoryQuantity: number | null
    options: { name: string; value: string }[]
  }[]
  collections: string[]
}

export type PullVendorShopifyProductsResult = {
  currencyCode: string
  requestedQueryCost?: number
  hasNextPage: boolean
  products: ShopifyPulledProduct[]
}

export const usePullVendorShopifyProducts = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.pullProducts,
    mutationFn: () =>
      request<PullVendorShopifyProductsResult>("/vendors/me/shopify-products"),
  })
