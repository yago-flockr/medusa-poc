import { vendorClient } from "@/vendor/lib/contract-client"
import type { PatchVendorsMeInput } from "@dtc/api-contracts/vendor/profile"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePatchVendorsMe = () =>
  useMutation({
    mutationKey: mutationKeys.profile.patchVendorsMe,
    mutationFn: async (input: PatchVendorsMeInput) => {
      const response = await vendorClient.patchVendorsMe({ body: input })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
