import { vendorClient } from "@/vendor/lib/contract-client"
import type { PostVendorsOrdersByIdDispatchInput } from "@dtc/api-contracts/vendor/orders"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsOrdersByIdAccept = () =>
  useMutation({
    mutationKey: mutationKeys.orders.postVendorsOrdersByIdAccept,
    mutationFn: async (id: string) => {
      const response = await vendorClient.postVendorsOrdersByIdAccept({
        params: { id },
        body: {},
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })

export const usePostVendorsOrdersByIdDispatch = () =>
  useMutation({
    mutationKey: mutationKeys.orders.postVendorsOrdersByIdDispatch,
    mutationFn: async ({
      id,
      ...body
    }: { id: string } & PostVendorsOrdersByIdDispatchInput) => {
      const response = await vendorClient.postVendorsOrdersByIdDispatch({
        params: { id },
        body,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
