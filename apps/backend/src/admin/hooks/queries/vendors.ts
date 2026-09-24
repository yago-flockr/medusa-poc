import type {
  VendorListQuery,
  VendorListResponse,
  VendorResponse,
} from "@dtc/api-contracts/admin/vendors"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useFindManyVendors = createResourceQueryHook<
  VendorListQuery,
  VendorListResponse
>({
  queryKey: (query) => [...queryKeys.vendors.findMany, query],
  queryFn: (query) =>
    sdk.client.fetch<VendorListResponse>("/admin/vendors", { query }),
})

export const useFindOneVendor = createResourceQueryHook<string, VendorResponse>(
  {
    queryKey: (vendorId) => [...queryKeys.vendors.findOne, vendorId],
    queryFn: (vendorId) =>
      sdk.client.fetch<VendorResponse>(`/admin/vendors/${vendorId}`),
  },
)
