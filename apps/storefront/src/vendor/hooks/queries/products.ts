import { vendorClient } from "@/vendor/lib/contract-client"
import type { VendorProductsListResponse } from "@dtc/api-contracts/vendor/products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetProducts = createResourceQueryHook<
  void,
  VendorProductsListResponse
>({
  queryKey: () => queryKeys.products.getProducts,
  queryFn: async () => {
    const response = await vendorClient.getProducts({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
