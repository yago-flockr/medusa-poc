import { request } from "@/vendor/lib/client"
import type {
  PostAuthVendorEmailpassInput,
  PostAuthVendorEmailpassResponse,
} from "@dtc/api-contracts/vendor/auth"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const usePostAuthVendorEmailpass = () =>
  useMutation({
    mutationKey: mutationKeys.auth.postAuthVendorEmailpass,
    mutationFn: ({ email, password }: PostAuthVendorEmailpassInput) =>
      request<PostAuthVendorEmailpassResponse>("/auth/vendor/emailpass", {
        method: "POST",
        body: { email, password },
      }),
  })
