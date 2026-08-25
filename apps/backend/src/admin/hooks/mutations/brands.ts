import type {
  BrandDeleteResponse,
  BrandResponse,
  CreateBrand,
  UpdateBrand,
} from "../../../api/admin/brands/contract"
import { createResourceMutationHook } from "../../lib/create-resource-mutation"
import { mutationKeys } from "./mutation-keys"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useCreateOneBrand = createResourceMutationHook<
  CreateBrand,
  BrandResponse
>({
  mutationKey: mutationKeys.brands.createOne,
  mutationFn: (body) =>
    sdk.client.fetch<BrandResponse>("/admin/brands", {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.brands.findMany,
})

export const useUpdateOneBrand = createResourceMutationHook<
  { brandId: string; body: UpdateBrand },
  BrandResponse
>({
  mutationKey: mutationKeys.brands.updateOne,
  mutationFn: ({ brandId, body }) =>
    sdk.client.fetch<BrandResponse>(`/admin/brands/${brandId}`, {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.brands.findMany,
})

export const useDeleteOneBrand = createResourceMutationHook<
  string,
  BrandDeleteResponse
>({
  mutationKey: mutationKeys.brands.deleteOne,
  mutationFn: (brandId) =>
    sdk.client.fetch<BrandDeleteResponse>(`/admin/brands/${brandId}`, {
      method: "DELETE",
    }),
  invalidateKey: queryKeys.brands.findMany,
})
