import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsProductsByIdInventoryResponse } from "@dtc/api-contracts/vendor/product-inventory"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsProductsByIdInventory = createResourceQueryHook<
  string,
  GetVendorsProductsByIdInventoryResponse
>({
  queryKey: (productId) =>
    queryKeys.productInventory.getVendorsProductsByIdInventory(productId),
  queryFn: (productId) =>
    tc(
      vendorClient.getVendorsProductsByIdInventory({
        params: { id: productId },
      }),
    ),
})
