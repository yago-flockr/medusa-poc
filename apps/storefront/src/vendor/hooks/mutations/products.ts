import { vendorClient } from "@/vendor/lib/contract-client"
import type {
  CreateVendorProduct,
  UpdateVendorProduct,
} from "@dtc/api-contracts/vendor/products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useCreateProduct = () =>
  useMutation({
    mutationKey: mutationKeys.products.createProduct,
    mutationFn: async (body: CreateVendorProduct) => {
      const response = await vendorClient.createProduct({ body })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useUpdateProduct = () =>
  useMutation({
    mutationKey: mutationKeys.products.updateProduct,
    mutationFn: async ({
      id,
      ...body
    }: { id: string } & UpdateVendorProduct) => {
      const response = await vendorClient.updateProduct({
        params: { id },
        body,
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
