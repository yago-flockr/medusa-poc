import type {
  BrandListQuery,
  BrandListResponse,
} from "../../../api/admin/brands/contract"
import { createResourceQueryHook } from "../../lib/create-resource-query"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useFindManyBrands = createResourceQueryHook<
  BrandListQuery,
  BrandListResponse
>({
  queryKey: (query) => [...queryKeys.brands.findMany, query],
  queryFn: (query) =>
    sdk.client.fetch<BrandListResponse>("/admin/brands", { query }),
})
