import { request } from "@/affiliate/lib/client"
import type {
  GetAffiliatesOrdersByIdResponse,
  GetAffiliatesOrdersResponse,
} from "@dtc/api-contracts/affiliate/orders"
import type { PaginationQuery } from "@dtc/api-contracts/common/pagination"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useGetAffiliatesOrders = ({
  limit,
  offset,
}: Required<PaginationQuery>) =>
  useQuery({
    queryKey: [...queryKeys.orders, { limit, offset }],
    queryFn: () =>
      request<GetAffiliatesOrdersResponse>(
        `/affiliates/orders?${new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        })}`,
      ),
    placeholderData: keepPreviousData,
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
