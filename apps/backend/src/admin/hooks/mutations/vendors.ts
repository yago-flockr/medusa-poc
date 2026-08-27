import { useMutation } from "@tanstack/react-query"
import type {
  CreateVendor,
  UpdateVendor,
  VendorResponse,
} from "../../../api/admin/vendors/contract"
import type { ShopifyProductsPullResult } from "../../../integrations/shopify/products"
import { createResourceMutationHook } from "../../lib/create-resource-mutation"
import { mutationKeys } from "./mutation-keys"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useCreateOneVendor = createResourceMutationHook<
  CreateVendor,
  VendorResponse
>({
  mutationKey: mutationKeys.vendors.createOne,
  mutationFn: (body) =>
    sdk.client.fetch<VendorResponse>("/admin/vendors", {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.vendors.findMany,
})

export const usePullVendorShopifyProducts = () =>
  useMutation({
    mutationKey: mutationKeys.vendors.pullShopifyProducts,
    mutationFn: (vendorId: string) =>
      sdk.client.fetch<ShopifyProductsPullResult>(
        `/admin/vendors/${vendorId}/shopify/products`,
      ),
  })

export const useGenerateVendorShopifyInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.vendors.generateShopifyInstallLink,
    mutationFn: (vendorId: string) =>
      sdk.client.fetch<{ installLink: string }>(
        `/admin/vendors/${vendorId}/shopify/connection/install-link`,
      ),
  })

export const useUpdateOneVendor = createResourceMutationHook<
  { vendorId: string; body: UpdateVendor },
  VendorResponse
>({
  mutationKey: mutationKeys.vendors.updateOne,
  mutationFn: ({ vendorId, body }) =>
    sdk.client.fetch<VendorResponse>(`/admin/vendors/${vendorId}`, {
      method: "POST",
      body,
    }),
  invalidateKey: queryKeys.vendors.findMany,
})
