"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { clearVendorToken, VendorApiError } from "./api"

// Every vendor page/action should route its catch block through this instead
// of showing a raw error or, worse, letting the rejection go uncaught: a 401
// means the stored token is invalid or expired, which is expected to happen
// (nothing here refreshes it) and must send the vendor back to log in, not
// crash the page.
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
