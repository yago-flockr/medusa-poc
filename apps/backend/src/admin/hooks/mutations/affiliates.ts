import type {
  AffiliateDeleteResponse,
  AffiliateResponse,
  AffiliateWithPasswordResponse,
  CreateAffiliate,
  RegenerateAffiliatePasswordResponse,
  UpdateAffiliate,
} from "@dtc/api-contracts/admin/affiliates"
import { createResourceMutationHook } from "../../lib/create-resource-mutation"
import { mutationKeys } from "./mutation-keys"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useCreateOneAffiliate = createResourceMutationHook<
  CreateAffiliate,
  AffiliateWithPasswordResponse
>({
  mutationKey: mutationKeys.affiliates.createOne,
  mutationFn: (body) =>
    sdk.client.fetch<AffiliateWithPasswordResponse>("/admin/affiliates", {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.affiliates.findMany,
})

export const useUpdateOneAffiliate = createResourceMutationHook<
  { affiliateId: string; body: UpdateAffiliate },
  AffiliateResponse
>({
  mutationKey: mutationKeys.affiliates.updateOne,
  mutationFn: ({ affiliateId, body }) =>
    sdk.client.fetch<AffiliateResponse>(`/admin/affiliates/${affiliateId}`, {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.affiliates.findMany,
})

export const useDeleteOneAffiliate = createResourceMutationHook<
  string,
  AffiliateDeleteResponse
>({
  mutationKey: mutationKeys.affiliates.deleteOne,
  mutationFn: (affiliateId) =>
    sdk.client.fetch<AffiliateDeleteResponse>(
      `/admin/affiliates/${affiliateId}`,
      { method: "DELETE" },
    ),
  invalidateKey: queryKeys.affiliates.findMany,
})

export const useRegenerateAffiliatePassword = createResourceMutationHook<
  string,
  RegenerateAffiliatePasswordResponse
>({
  mutationKey: mutationKeys.affiliates.regeneratePassword,
  mutationFn: (affiliateId) =>
    sdk.client.fetch<RegenerateAffiliatePasswordResponse>(
      `/admin/affiliates/${affiliateId}/regenerate-password`,
      { method: "POST" },
    ),
  invalidateKey: queryKeys.affiliates.findMany,
})
