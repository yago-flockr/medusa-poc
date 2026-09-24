import { request } from "@/affiliate/lib/client"
import type {
  PatchAffiliatesMeInput,
  PatchAffiliatesMeResponse,
} from "@dtc/api-contracts/affiliate/profile"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../queries/query-keys"
import { mutationKeys } from "./mutation-keys"

export const usePatchAffiliatesMe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.profile.patchAffiliatesMe,
    mutationFn: (input: PatchAffiliatesMeInput) =>
      request<PatchAffiliatesMeResponse>("/affiliates/me", {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}
