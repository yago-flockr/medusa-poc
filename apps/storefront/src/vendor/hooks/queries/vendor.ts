import { vendorClient } from "@/vendor/lib/contract-client"
import type { GetVendorsMeResponse } from "@dtc/api-contracts/vendor/me"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsMe = createResourceQueryHook<
  void,
  GetVendorsMeResponse
>({
  queryKey: () => queryKeys.vendor.getVendorsMe,
  queryFn: async () => {
    const response = await vendorClient.getVendorsMe()
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
