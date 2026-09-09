import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsShopifyProductsResponse } from "@dtc/api-contracts/vendor/shopify-products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsShopifyProducts = createResourceQueryHook<
  void,
  GetVendorsShopifyProductsResponse
>({
  queryKey: () => queryKeys.shopifyProducts.getVendorsShopifyProducts,
  queryFn: () => tc(vendorClient.getVendorsShopifyProducts()),
})
