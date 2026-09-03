import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type {
  PostVendorsStockLocationsInput,
  PostVendorsStockLocationsByIdInput,
} from "@dtc/api-contracts/vendor/stock-locations"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsStockLocations = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.postVendorsStockLocations,
    mutationFn: (body: PostVendorsStockLocationsInput) =>
      tc(vendorClient.postVendorsStockLocations({ body })),
  })

export const usePostVendorsStockLocationsById = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.postVendorsStockLocationsById,
    mutationFn: ({
      id,
      ...body
    }: { id: string } & PostVendorsStockLocationsByIdInput) =>
      tc(vendorClient.postVendorsStockLocationsById({ params: { id }, body })),
  })

export const useDeleteVendorsStockLocationsById = () =>
  useMutation({
    mutationKey: mutationKeys.stockLocations.deleteVendorsStockLocationsById,
    mutationFn: (id: string) =>
      tc(vendorClient.deleteVendorsStockLocationsById({ params: { id } })),
  })
