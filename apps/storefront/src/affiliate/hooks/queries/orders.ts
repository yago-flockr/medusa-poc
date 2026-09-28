import { request } from "@/affiliate/lib/client"
import type {
  GetAffiliatesOrdersByIdResponse,
  GetAffiliatesOrdersResponse,
} from "@dtc/api-contracts/affiliate/orders"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useGetAffiliatesOrders = () =>
  useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => request<GetAffiliatesOrdersResponse>("/affiliates/orders"),
  })

export const useGetAffiliatesOrdersById = (
  id: string,
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: queryKeys.ordersById(id),
    queryFn: () =>
      request<GetAffiliatesOrdersByIdResponse>(`/affiliates/orders/${id}`),
    ...options,
  })
