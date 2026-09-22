import { request } from "@/affiliate/lib/client"
import type { GetAffiliatesProductsResponse } from "@dtc/api-contracts/affiliate/products"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useGetAffiliatesProducts = () =>
  useQuery({
    queryKey: queryKeys.products,
    queryFn: () =>
      request<GetAffiliatesProductsResponse>("/affiliates/products"),
  })
