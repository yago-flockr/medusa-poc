"use client"

import { VendorApiError } from "@/vendor/lib/client"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useVendorErrorHandler() {
  const router = useRouter()
  const clearToken = useVendorAuthStore((s) => s.clearToken)

  return useCallback(
    (error: unknown): string => {
      if (error instanceof VendorApiError && error.status === 401) {
        clearToken()
        router.replace("/vendor")
        return "Session expired. Redirecting to login…"
      }

      return error instanceof Error ? error.message : "Something went wrong."
    },
    [router, clearToken],
  )
}
