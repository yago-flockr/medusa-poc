"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { clearVendorToken, VendorApiError } from "./api"

export function useVendorErrorHandler() {
  const router = useRouter()

  return useCallback(
    (error: unknown): string => {
      if (error instanceof VendorApiError && error.status === 401) {
        clearVendorToken()
        router.replace("/vendor")
        return "Session expired. Redirecting to login…"
      }

      return error instanceof Error ? error.message : "Something went wrong."
    },
    [router],
  )
}
