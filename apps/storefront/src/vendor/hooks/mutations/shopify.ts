import { vendorClient } from "@/vendor/lib/contract-client"
import type { SetVendorShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import type { ImportVendorShopifyProductsInput } from "@dtc/api-contracts/vendor/shopify-products"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useSetShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.setShopifyConnection,
    mutationFn: async (input: SetVendorShopifyConnectionInput) => {
      const response = await vendorClient.setShopifyConnection({ body: input })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useGetShopifyInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getShopifyInstallLink,
    mutationFn: async () => {
      const response = await vendorClient.getShopifyInstallLink()
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useImportShopifyProducts = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.importShopifyProducts,
    mutationFn: async (input: ImportVendorShopifyProductsInput) => {
      const response = await vendorClient.importShopifyProducts({ body: input })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
