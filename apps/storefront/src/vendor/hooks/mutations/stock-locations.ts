import { vendorClient } from "@/vendor/lib/contract-client"
import type {
  PostVendorsStockLocationsInput,
  PostVendorsStockLocationsByIdInput,
} from "@dtc/api-contracts/vendor/stock-locations"
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

export const usePostVendorsStockLocationsById = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.postVendorsStockLocationsById,
    mutationFn: async ({
      id,
      ...body
    }: { id: string } & PostVendorsStockLocationsByIdInput) => {
      const response = await vendorClient.postVendorsStockLocationsById({
        params: { id },
        body,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const useDeleteVendorsStockLocationsById = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.deleteVendorsStockLocationsById,
    mutationFn: async (id: string) => {
      const response = await vendorClient.deleteVendorsStockLocationsById({
        params: { id },
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
