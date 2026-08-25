"use client"

import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useRequireVendorAuth() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!useVendorAuthStore.getState().token) {
      router.replace("/vendor")
      return
    }
    setChecked(true)
  }, [router])

  return checked
}
