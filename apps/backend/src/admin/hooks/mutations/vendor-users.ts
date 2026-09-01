import type {
  CreateVendorUser,
  RegenerateVendorUserPasswordResponse,
  UpdateVendorUser,
  VendorUserResponse,
  VendorUserWithPasswordResponse,
} from "@dtc/api-contracts/admin/vendor-users"
import { createResourceMutationHook } from "../../lib/create-resource-mutation"
import { mutationKeys } from "./mutation-keys"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useCreateOneVendorUser = createResourceMutationHook<
  CreateVendorUser,
  VendorUserWithPasswordResponse
>({
  mutationKey: mutationKeys.vendorUsers.createOne,
  mutationFn: (body) =>
    sdk.client.fetch<VendorUserWithPasswordResponse>("/admin/vendor-users", {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.vendorUsers.findMany,
})

export const useUpdateOneVendorUser = createResourceMutationHook<
  { vendorUserId: string; body: UpdateVendorUser },
  VendorUserResponse
>({
  mutationKey: mutationKeys.vendorUsers.updateOne,
  mutationFn: ({ vendorUserId, body }) =>
    sdk.client.fetch<VendorUserResponse>(
      `/admin/vendor-users/${vendorUserId}`,
      { method: "POST", body },
    ),
  invalidateKey: queryKeys.vendorUsers.findMany,
})

export const useRegenerateVendorUserPassword = createResourceMutationHook<
  string,
  RegenerateVendorUserPasswordResponse
>({
  mutationKey: mutationKeys.vendorUsers.regeneratePassword,
  mutationFn: (vendorUserId) =>
    sdk.client.fetch<RegenerateVendorUserPasswordResponse>(
      `/admin/vendor-users/${vendorUserId}/regenerate-password`,
      { method: "POST" },
    ),
  invalidateKey: queryKeys.vendorUsers.findMany,
})
