import { vendorClient } from "@/vendor/lib/contract-client"
import type { SetVendorShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useSetVendorShopifyConnection = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.setConnection,
    mutationFn: async (input: SetVendorShopifyConnectionInput) => {
      const response = await vendorClient.setShopifyConnection({ body: input })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useGetVendorShopifyInstallLink = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.getInstallLink,
    mutationFn: async () => {
      const response = await vendorClient.getShopifyInstallLink()
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const usePullVendorShopifyProducts = () =>
  useMutation({
    mutationKey: mutationKeys.shopify.pullProducts,
    mutationFn: async () => {
      const response = await vendorClient.pullShopifyProducts()
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
