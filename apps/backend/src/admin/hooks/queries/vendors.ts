import type {
  VendorListQuery,
  VendorListResponse,
} from "../../../api/admin/vendors/contract"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "../../lib/query-keys"
import { sdk } from "../../lib/sdk"

export const useFindManyVendors = createResourceQueryHook<
  VendorListQuery,
  VendorListResponse
>({
  queryKey: (query) => [...queryKeys.vendors.findMany, query],
  queryFn: (query) =>
    sdk.client.fetch<VendorListResponse>("/admin/vendors", { query }),
})
