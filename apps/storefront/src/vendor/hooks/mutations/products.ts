import { vendorClient } from "@/vendor/lib/contract-client"
import type {
  PostVendorsProductsInput,
  PostVendorsProductsByIdInput,
} from "@dtc/api-contracts/vendor/products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsProducts = () =>
  useMutation({
    mutationKey: mutationKeys.products.postVendorsProducts,
    mutationFn: async (body: PostVendorsProductsInput) => {
      const response = await vendorClient.postVendorsProducts({ body })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const usePostVendorsProductsById = () =>
  useMutation({
    mutationKey: mutationKeys.products.postVendorsProductsById,
    mutationFn: async ({
      id,
      ...body
    }: { id: string } & PostVendorsProductsByIdInput) => {
      const response = await vendorClient.postVendorsProductsById({
        params: { id },
        body,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useDeleteVendorsProductsById = () =>
  useMutation({
    mutationKey: mutationKeys.products.deleteVendorsProductsById,
    mutationFn: async (id: string) => {
      const response = await vendorClient.deleteVendorsProductsById({
        params: { id },
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
