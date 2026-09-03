import { tc } from "@/vendor/lib/tc"
import { vendorClient } from "@/vendor/lib/contract-client"
import type {
  GetVendorsProductsByIdResponse,
  GetVendorsProductsResponse,
} from "@dtc/api-contracts/vendor/products"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useGetVendorsProducts = createResourceQueryHook<
  void,
  GetVendorsProductsResponse
>({
  queryKey: () => queryKeys.products.getVendorsProducts,
  queryFn: () => tc(vendorClient.getVendorsProducts({ query: {} })),
})

export const useGetVendorsProductsById = createResourceQueryHook<
  string,
  GetVendorsProductsByIdResponse
>({
  queryKey: (productId) => queryKeys.products.getVendorsProductsById(productId),
  queryFn: (productId) =>
    tc(vendorClient.getVendorsProductsById({ params: { id: productId } })),
})
