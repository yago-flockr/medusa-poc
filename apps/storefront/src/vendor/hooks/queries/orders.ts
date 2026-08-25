import { request } from "@/vendor/lib/client"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export type VendorOrder = {
  id: string
  display_id: number
  status: string
  total: number
  currency_code: string
  items: Array<{ id: string; title: string; quantity: number }>
}

export type VendorOrdersListResponse = {
  orders: VendorOrder[]
  count: number
  limit: number
  offset: number
}

export const useFindManyVendorOrders = createResourceQueryHook<
  void,
  VendorOrdersListResponse
>({
  queryKey: () => queryKeys.orders.findMany,
  queryFn: () => request<VendorOrdersListResponse>("/vendors/orders"),
})
