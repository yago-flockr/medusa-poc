import { vendorClient } from "@/vendor/lib/contract-client"
import type { VendorStockLocationsListResponse } from "@dtc/api-contracts/vendor/stock-locations"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetStockLocations = createResourceQueryHook<
  void,
  VendorStockLocationsListResponse
>({
  queryKey: () => queryKeys.stockLocations.getStockLocations,
  queryFn: async () => {
    const response = await vendorClient.getStockLocations({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
