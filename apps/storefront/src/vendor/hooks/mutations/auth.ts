import { request } from "@/vendor/lib/client"
import type {
  LoginVendorInput,
  LoginVendorResponse,
} from "@dtc/api-contracts/vendor/auth"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useLoginVendor = () =>
  useMutation({
    mutationKey: mutationKeys.auth.login,
    mutationFn: ({ email, password }: LoginVendorInput) =>
      request<LoginVendorResponse>("/auth/vendor/emailpass", {
        method: "POST",
        body: { email, password },
      }),
  })
