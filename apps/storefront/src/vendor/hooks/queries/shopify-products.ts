import { vendorClient } from "@/vendor/lib/contract-client"
import type { GetVendorsMeShopifyProductsResponse } from "@dtc/api-contracts/vendor/shopify-products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsMeShopifyProducts = createResourceQueryHook<
  void,
  GetVendorsMeShopifyProductsResponse
>({
  queryKey: () => queryKeys.shopifyProducts.getVendorsMeShopifyProducts,
  queryFn: async () => {
    const response = await vendorClient.getVendorsMeShopifyProducts()
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
