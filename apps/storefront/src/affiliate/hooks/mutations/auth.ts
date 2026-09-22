import { request } from "@/affiliate/lib/client"
import type {
  PostAuthAffiliateEmailpassInput,
  PostAuthAffiliateEmailpassResponse,
} from "@dtc/api-contracts/affiliate/auth"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostAuthAffiliateEmailpass = () =>
  useMutation({
    mutationKey: mutationKeys.auth.postAuthAffiliateEmailpass,
    mutationFn: ({ email, password }: PostAuthAffiliateEmailpassInput) =>
      request<PostAuthAffiliateEmailpassResponse>("/auth/affiliate/emailpass", {
        method: "POST",
        body: { email, password },
      }),
  })
