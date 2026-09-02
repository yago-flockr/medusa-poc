import { vendorClient } from "@/vendor/lib/contract-client"
import type { GetVendorsStockLocationsResponse } from "@dtc/api-contracts/vendor/stock-locations"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsStockLocations = createResourceQueryHook<
  void,
  GetVendorsStockLocationsResponse
>({
  queryKey: () => queryKeys.stockLocations.getVendorsStockLocations,
  queryFn: async () => {
    const response = await vendorClient.getVendorsStockLocations({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
