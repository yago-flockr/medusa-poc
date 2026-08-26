import { vendorClient } from "@/vendor/lib/contract-client"
import type { VendorMeResponse } from "@dtc/api-contracts/vendor/me"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useFindOneVendor = createResourceQueryHook<void, VendorMeResponse>({
  queryKey: () => queryKeys.vendor.findOne,
  queryFn: async () => {
    const response = await vendorClient.getMe()
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
