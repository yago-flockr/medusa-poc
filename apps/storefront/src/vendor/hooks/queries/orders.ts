import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type {
  GetVendorsOrdersByIdResponse,
  GetVendorsOrdersResponse,
} from "@dtc/api-contracts/vendor/orders"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsOrders = createResourceQueryHook<
  void,
  GetVendorsOrdersResponse
>({
  queryKey: () => queryKeys.orders.getVendorsOrders,
  queryFn: () => tc(vendorClient.getVendorsOrders({ query: {} })),
})

export const useGetVendorsOrdersById = createResourceQueryHook<
  string,
  GetVendorsOrdersByIdResponse
>({
  queryKey: (orderId) => queryKeys.orders.getVendorsOrdersById(orderId),
  queryFn: (orderId) =>
    tc(vendorClient.getVendorsOrdersById({ params: { id: orderId } })),
})
