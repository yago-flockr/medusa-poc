import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsMeResponse } from "@dtc/api-contracts/vendor/me"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsMe = createResourceQueryHook<
  void,
  GetVendorsMeResponse
>({
  queryKey: () => queryKeys.vendor.getVendorsMe,
  queryFn: () => tc(vendorClient.getVendorsMe()),
})
