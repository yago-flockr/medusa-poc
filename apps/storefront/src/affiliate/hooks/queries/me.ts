import { request } from "@/affiliate/lib/client"
import type { GetAffiliatesMeResponse } from "@dtc/api-contracts/affiliate/me"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useGetAffiliatesMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => request<GetAffiliatesMeResponse>("/affiliates/me"),
  })
