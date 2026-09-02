import { vendorClient } from "@/vendor/lib/contract-client"
import type { PostVendorsProductsByIdInventoryInput } from "@dtc/api-contracts/vendor/product-inventory"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsProductsByIdInventory = () =>
  useMutation({
    mutationKey: mutationKeys.productInventory.postVendorsProductsByIdInventory,
    mutationFn: async ({
      productId,
      ...body
    }: { productId: string } & PostVendorsProductsByIdInventoryInput) => {
      const response = await vendorClient.postVendorsProductsByIdInventory({
        params: { id: productId },
        body,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
