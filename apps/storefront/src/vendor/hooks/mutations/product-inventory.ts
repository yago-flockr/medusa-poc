import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { PostVendorsProductsByIdInventoryInput } from "@dtc/api-contracts/vendor/product-inventory"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostVendorsProductsByIdInventory = () =>
  useMutation({
    mutationKey: mutationKeys.productInventory.postVendorsProductsByIdInventory,
    mutationFn: ({
      productId,
      ...body
    }: { productId: string } & PostVendorsProductsByIdInventoryInput) =>
      tc(
        vendorClient.postVendorsProductsByIdInventory({
          params: { id: productId },
          body,
        }),
      ),
  })
