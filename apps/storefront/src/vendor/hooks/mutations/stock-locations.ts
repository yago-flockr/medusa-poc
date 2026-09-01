import { vendorClient } from "@/vendor/lib/contract-client"
import type { CreateVendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useCreateStockLocation = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.createStockLocation,
    mutationFn: async (body: CreateVendorStockLocation) => {
      const response = await vendorClient.createStockLocation({ body })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
