import { vendorClient } from "@/vendor/lib/contract-client"
import type { SetVendorInventoryLevel } from "@dtc/api-contracts/vendor/product-inventory"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useSetProductInventory = () =>
  useMutation({
    mutationKey: mutationKeys.productInventory.setProductInventory,
    mutationFn: async ({
      productId,
      ...body
    }: { productId: string } & SetVendorInventoryLevel) => {
      const response = await vendorClient.setProductInventory({
        params: { id: productId },
        body,
      })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
