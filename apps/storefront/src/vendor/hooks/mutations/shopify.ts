import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { PatchVendorsMeShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import type { PostVendorsMeShopifyProductsImportInput } from "@dtc/api-contracts/vendor/shopify-products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePatchVendorsMeShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.patchVendorsMeShopifyConnection,
    mutationFn: (input: PatchVendorsMeShopifyConnectionInput) =>
      tc(vendorClient.patchVendorsMeShopifyConnection({ body: input })),
  })

export const useGetVendorsMeShopifyConnectionInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getVendorsMeShopifyConnectionInstallLink,
    mutationFn: () =>
      tc(vendorClient.getVendorsMeShopifyConnectionInstallLink()),
  })

export const usePostVendorsMeShopifyProductsImport = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.postVendorsMeShopifyProductsImport,
    mutationFn: (input: PostVendorsMeShopifyProductsImportInput) =>
      tc(vendorClient.postVendorsMeShopifyProductsImport({ body: input })),
  })
