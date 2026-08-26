import { request } from "@/vendor/lib/client"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export type VendorMeResponse = {
  vendor_user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  }
  vendor: {
    id: string
    name: string
    handle: string
    shopify_store_domain: string | null
    shopify_client_id: string | null
    shopify_connected_at: string | null
    shopify_connected: boolean
  }
}

export const useFindOneVendor = createResourceQueryHook<void, VendorMeResponse>({
  queryKey: () => queryKeys.vendor.findOne,
  queryFn: () => request<VendorMeResponse>("/vendors/me"),
})
