import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  BrandDeleteResponse,
  BrandResponse,
  CreateBrand,
  UpdateBrand,
} from "../../../api/admin/brands/contract"
import { queryKeys } from "../../lib/query-keys"
import { sdk } from "../../lib/sdk"

export const useCreateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBrand) =>
      sdk.client.fetch<BrandResponse>("/admin/brands", {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
    },
  })
}

export const useUpdateBrand = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateBrand) =>
      sdk.client.fetch<BrandResponse>(`/admin/brands/${id}`, {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
    },
  })
}

export const useDeleteBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch<BrandDeleteResponse>(`/admin/brands/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.brands.all })
    },
  })
}
