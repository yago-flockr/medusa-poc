import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { GetVendorsMeShopifyProductsResponse } from "@dtc/api-contracts/vendor/shopify-products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsMeShopifyProducts = createResourceQueryHook<
  void,
  GetVendorsMeShopifyProductsResponse
>({
  queryKey: () => queryKeys.shopifyProducts.getVendorsMeShopifyProducts,
  queryFn: () => tc(vendorClient.getVendorsMeShopifyProducts()),
})
