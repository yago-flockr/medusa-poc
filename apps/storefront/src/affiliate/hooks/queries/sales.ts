import { request } from "@/affiliate/lib/client"
import type { GetAffiliatesSalesResponse } from "@dtc/api-contracts/affiliate/sales"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useGetAffiliatesSales = () =>
  useQuery({
    queryKey: queryKeys.sales,
    queryFn: () => request<GetAffiliatesSalesResponse>("/affiliates/sales"),
  })
