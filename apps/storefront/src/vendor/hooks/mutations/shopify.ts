import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { PatchVendorsShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import type { PostVendorsShopifyProductsImportInput } from "@dtc/api-contracts/vendor/shopify-products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePatchVendorsShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.patchVendorsShopifyConnection,
    mutationFn: (input: PatchVendorsShopifyConnectionInput) =>
      tc(vendorClient.patchVendorsShopifyConnection({ body: input })),
  })

export const useGetVendorsShopifyConnectionInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getVendorsShopifyConnectionInstallLink,
    mutationFn: () => tc(vendorClient.getVendorsShopifyConnectionInstallLink()),
  })

export const usePostVendorsShopifyProductsImport = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.postVendorsShopifyProductsImport,
    mutationFn: (input: PostVendorsShopifyProductsImportInput) =>
      tc(vendorClient.postVendorsShopifyProductsImport({ body: input })),
  })
