import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsRegionsResponse } from "@dtc/api-contracts/vendor/regions"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsRegions = createResourceQueryHook<
  void,
  GetVendorsRegionsResponse
>({
  queryKey: () => queryKeys.regions.getVendorsRegions,
  queryFn: () => tc(vendorClient.getVendorsRegions()),
})
