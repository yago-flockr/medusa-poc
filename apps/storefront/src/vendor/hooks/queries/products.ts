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
  queryFn: async () => {
    const response = await vendorClient.getVendorsProducts({ query: {} })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})

export const useGetVendorsProductsById = createResourceQueryHook<
  string,
  GetVendorsProductsByIdResponse
>({
  queryKey: (productId) => queryKeys.products.getVendorsProductsById(productId),
  queryFn: async (productId) => {
    const response = await vendorClient.getVendorsProductsById({
      params: { id: productId },
    })
    if (response.status !== 200) {
      throw new Error(`Unexpected response status ${response.status}`)
    }
    return response.body
  },
})
