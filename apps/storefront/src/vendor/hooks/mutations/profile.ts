import { vendorClient } from "@/vendor/lib/contract-client"
import type { UpdateVendorProfileInput } from "@dtc/api-contracts/vendor/profile"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useUpdateVendorProfile = () =>
  useMutation({
    mutationKey: mutationKeys.profile.update,
    mutationFn: async (input: UpdateVendorProfileInput) => {
      const response = await vendorClient.updateProfile({ body: input })
      if (response.status !== 200) {
        throw new Error(`Unexpected response status ${response.status}`)
      }
      return response.body
    },
  })
