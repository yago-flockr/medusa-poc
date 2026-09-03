import { vendorClient } from "@/vendor/lib/contract-client"
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
  queryFn: async () => {
    const response = await vendorClient.getVendorsOrders({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})

export const useGetVendorsOrdersById = createResourceQueryHook<
  string,
  GetVendorsOrdersByIdResponse
>({
  queryKey: (orderId) => queryKeys.orders.getVendorsOrdersById(orderId),
  queryFn: async (orderId) => {
    const response = await vendorClient.getVendorsOrdersById({
      params: { id: orderId },
    })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
