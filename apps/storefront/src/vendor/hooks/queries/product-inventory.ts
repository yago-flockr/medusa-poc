import { vendorClient } from "@/vendor/lib/contract-client"
import type { VendorProductInventoryResponse } from "@dtc/api-contracts/vendor/product-inventory"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetProductInventory = createResourceQueryHook<
  string,
  VendorProductInventoryResponse
>({
  queryKey: (productId) => queryKeys.productInventory.getProductInventory(productId),
  queryFn: async (productId) => {
    const response = await vendorClient.getProductInventory({
      params: { id: productId },
    })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
