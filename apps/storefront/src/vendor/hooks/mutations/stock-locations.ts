import { vendorClient } from "@/vendor/lib/contract-client"
import type { PostVendorsStockLocationsInput } from "@dtc/api-contracts/vendor/stock-locations"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsStockLocations = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.postVendorsStockLocations,
    mutationFn: async (body: PostVendorsStockLocationsInput) => {
      const response = await vendorClient.postVendorsStockLocations({ body })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
