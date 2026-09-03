import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { PostVendorsOrdersByIdDispatchInput } from "@dtc/api-contracts/vendor/orders"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsOrdersByIdAccept = () =>
  useMutation({
    mutationKey: mutationKeys.orders.postVendorsOrdersByIdAccept,
    mutationFn: (id: string) =>
      tc(vendorClient.postVendorsOrdersByIdAccept({ params: { id }, body: {} })),
  })

export const usePostVendorsOrdersByIdDispatch = () =>
  useMutation({
    mutationKey: mutationKeys.orders.postVendorsOrdersByIdDispatch,
    mutationFn: ({
      id,
      ...body
    }: { id: string } & PostVendorsOrdersByIdDispatchInput) =>
      tc(vendorClient.postVendorsOrdersByIdDispatch({ params: { id }, body })),
  })
