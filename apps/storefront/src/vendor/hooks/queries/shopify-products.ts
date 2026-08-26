import { vendorClient } from "@/vendor/lib/contract-client"
import type { PullVendorShopifyProductsResponse } from "@dtc/api-contracts/vendor/shopify-products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const usePullShopifyProducts = createResourceQueryHook<
  void,
  PullVendorShopifyProductsResponse
>({
  queryKey: () => queryKeys.shopifyProducts.pullShopifyProducts,
  queryFn: async () => {
    const response = await vendorClient.pullShopifyProducts()
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
