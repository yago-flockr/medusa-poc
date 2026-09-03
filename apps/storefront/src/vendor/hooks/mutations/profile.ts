import { vendorClient } from "@/vendor/lib/contract-client"
import { tc } from "@/vendor/lib/tc"
import type { PatchVendorsMeInput } from "@dtc/api-contracts/vendor/profile"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePatchVendorsMe = () =>
  useMutation({
    mutationKey: mutationKeys.profile.patchVendorsMe,
    mutationFn: (input: PatchVendorsMeInput) =>
      tc(vendorClient.patchVendorsMe({ body: input })),
  })
