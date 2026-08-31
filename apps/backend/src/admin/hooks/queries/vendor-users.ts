import type {
  VendorUserListQuery,
  VendorUserListResponse,
} from "@dtc/api-contracts/admin/vendor-users"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useFindManyVendorUsers = createResourceQueryHook<
  VendorUserListQuery,
  VendorUserListResponse
>({
  queryKey: (query) => [...queryKeys.vendorUsers.findMany, query],
  queryFn: (query) =>
    sdk.client.fetch<VendorUserListResponse>("/admin/vendor-users", {
      query,
    }),
})
