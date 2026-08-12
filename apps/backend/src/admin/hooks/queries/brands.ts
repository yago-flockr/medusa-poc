import { useQuery } from "@tanstack/react-query"
import type {
  Brand,
  BrandListQuery,
} from "../../../api/admin/brands/contract"
import type { CustomListResponse } from "../../../api/admin/list-response"
import { queryKeys } from "../../lib/query-keys"
import { sdk } from "../../lib/sdk"

export type { Brand, BrandListQuery }

export const useAdminBrandList = (query: BrandListQuery) =>
  useQuery({
    queryKey: queryKeys.brands.byQuery(query),
    queryFn: () =>
      sdk.client.fetch<CustomListResponse<"brands", Brand>>("/admin/brands", {
        query,
      }),
  })
