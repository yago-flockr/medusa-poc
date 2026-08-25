import type { LoginVendorInput } from "@/vendor/forms/login-form"
import { request } from "@/vendor/lib/client"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useLoginVendor = () =>
  useMutation({
    mutationKey: mutationKeys.auth.login,
    mutationFn: ({ email, password }: LoginVendorInput) =>
      request<{ token: string }>("/auth/vendor/emailpass", {
        method: "POST",
        body: { email, password },
      }),
  })
