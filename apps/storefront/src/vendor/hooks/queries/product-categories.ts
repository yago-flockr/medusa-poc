import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsProductCategoriesResponse } from "@dtc/api-contracts/vendor/product-categories"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsProductCategories = createResourceQueryHook<
  void,
  GetVendorsProductCategoriesResponse
>({
  queryKey: () => queryKeys.productCategories.getVendorsProductCategories,
  queryFn: () => tc(vendorClient.getVendorsProductCategories()),
})
