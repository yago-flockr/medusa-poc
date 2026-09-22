import { request } from "@/affiliate/lib/client"
import type {
  DeleteAffiliatesProductResponse,
  GetAffiliatesProductsResponse,
  PostAffiliatesProductsInput,
} from "@dtc/api-contracts/affiliate/products"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../queries/query-keys"
import { mutationKeys } from "./mutation-keys"

export const usePostAffiliatesProducts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.products.postAffiliatesProducts,
    mutationFn: (input: PostAffiliatesProductsInput) =>
      request<GetAffiliatesProductsResponse>("/affiliates/products", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })
}

export const useDeleteAffiliatesProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.products.deleteAffiliatesProduct,
    mutationFn: (productId: string) =>
      request<DeleteAffiliatesProductResponse>(
        `/affiliates/products/${productId}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })
}
