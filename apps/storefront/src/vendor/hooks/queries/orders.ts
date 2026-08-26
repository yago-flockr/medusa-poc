import { vendorClient } from "@/vendor/lib/contract-client"
import type { VendorOrdersListResponse } from "@dtc/api-contracts/vendor/orders"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetOrders = createResourceQueryHook<
  void,
  VendorOrdersListResponse
>({
  queryKey: () => queryKeys.orders.getOrders,
  queryFn: async () => {
    const response = await vendorClient.getOrders({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
