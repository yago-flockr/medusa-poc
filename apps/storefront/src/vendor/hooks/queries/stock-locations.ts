import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsStockLocationsResponse } from "@dtc/api-contracts/vendor/stock-locations"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsStockLocations = createResourceQueryHook<
  void,
  GetVendorsStockLocationsResponse
>({
  queryKey: () => queryKeys.stockLocations.getVendorsStockLocations,
  queryFn: () => tc(vendorClient.getVendorsStockLocations({ query: {} })),
})
