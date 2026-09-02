import { vendorClient } from "@/vendor/lib/contract-client"
import type { GetVendorsOrdersResponse } from "@dtc/api-contracts/vendor/orders"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsOrders = createResourceQueryHook<
  void,
  GetVendorsOrdersResponse
>({
  queryKey: () => queryKeys.orders.getVendorsOrders,
  queryFn: async () => {
    const response = await vendorClient.getVendorsOrders({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
