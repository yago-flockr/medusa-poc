import { vendorClient } from "@/vendor/lib/contract-client"
import type { GetVendorsProductsByIdInventoryResponse } from "@dtc/api-contracts/vendor/product-inventory"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsProductsByIdInventory = createResourceQueryHook<
  string,
  GetVendorsProductsByIdInventoryResponse
>({
  queryKey: (productId) =>
    queryKeys.productInventory.getVendorsProductsByIdInventory(productId),
  queryFn: async (productId) => {
    const response = await vendorClient.getVendorsProductsByIdInventory({
      params: { id: productId },
    })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
