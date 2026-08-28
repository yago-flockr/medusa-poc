import { vendorClient } from "@/vendor/lib/contract-client"
import type { UpdateVendorProductStatusInput } from "@dtc/api-contracts/vendor/products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useUpdateProductStatus = () =>
  useMutation({
    mutationKey: mutationKeys.products.updateProductStatus,
    mutationFn: async ({
      id,
      status,
    }: { id: string } & UpdateVendorProductStatusInput) => {
      const response = await vendorClient.updateProductStatus({
        params: { id },
        body: { status },
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useDeleteProduct = () =>
  useMutation({
    mutationKey: mutationKeys.products.deleteProduct,
    mutationFn: async (id: string) => {
      const response = await vendorClient.deleteProduct({ params: { id } })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
