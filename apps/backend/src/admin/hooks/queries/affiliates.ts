import type {
  AffiliateListQuery,
  AffiliateListResponse,
} from "@dtc/api-contracts/admin/affiliates"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useFindManyAffiliates = createResourceQueryHook<
  AffiliateListQuery,
  AffiliateListResponse
>({
  queryKey: (query) => [...queryKeys.affiliates.findMany, query],
  queryFn: (query) =>
    sdk.client.fetch<AffiliateListResponse>("/admin/affiliates", { query }),
})
