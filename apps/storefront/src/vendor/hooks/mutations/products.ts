import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type {
  PostVendorsProductsInput,
  PostVendorsProductsByIdInput,
} from "@dtc/api-contracts/vendor/products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsProducts = () =>
  useMutation({
    mutationKey: mutationKeys.products.postVendorsProducts,
    mutationFn: (body: PostVendorsProductsInput) =>
      tc(vendorClient.postVendorsProducts({ body })),
  })

export const usePostVendorsProductsById = () =>
  useMutation({
    mutationKey: mutationKeys.products.postVendorsProductsById,
    mutationFn: ({
      id,
      ...body
    }: { id: string } & PostVendorsProductsByIdInput) =>
      tc(vendorClient.postVendorsProductsById({ params: { id }, body })),
  })

export const useDeleteVendorsProductsById = () =>
  useMutation({
    mutationKey: mutationKeys.products.deleteVendorsProductsById,
    mutationFn: (id: string) =>
      tc(vendorClient.deleteVendorsProductsById({ params: { id } })),
  })
