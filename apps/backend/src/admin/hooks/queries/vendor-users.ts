import type {
  VendorUserListQuery,
  VendorUserListResponse,
} from "../../../api/admin/vendor-users/contract"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "../../lib/query-keys"
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
