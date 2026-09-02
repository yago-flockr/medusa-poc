import { vendorClient } from "@/vendor/lib/contract-client"
import type { PatchVendorsMeShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import type { PostVendorsMeShopifyProductsImportInput } from "@dtc/api-contracts/vendor/shopify-products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePatchVendorsMeShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.patchVendorsMeShopifyConnection,
    mutationFn: async (input: PatchVendorsMeShopifyConnectionInput) => {
      const response = await vendorClient.patchVendorsMeShopifyConnection({
        body: input,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useGetVendorsMeShopifyConnectionInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getVendorsMeShopifyConnectionInstallLink,
    mutationFn: async () => {
      const response =
        await vendorClient.getVendorsMeShopifyConnectionInstallLink()
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const usePostVendorsMeShopifyProductsImport = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.postVendorsMeShopifyProductsImport,
    mutationFn: async (input: PostVendorsMeShopifyProductsImportInput) => {
      const response = await vendorClient.postVendorsMeShopifyProductsImport({
        body: input,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
