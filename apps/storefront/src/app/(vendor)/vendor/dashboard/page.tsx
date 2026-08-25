"use client"

import { useVendorAuthStore } from "@vendor/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VendorDashboardPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const clearToken = useVendorAuthStore((s) => s.clearToken)

  useEffect(() => {
    if (!useVendorAuthStore.getState().token) {
      router.replace("/vendor")
      return
    }
    setChecked(true)
  }, [router])

  if (!checked) {
    return null
  }

  return (
    <div>
      <h1 className="text-lg font-medium mb-4">You&apos;re logged in</h1>
      <button
        type="button"
        onClick={() => {
          clearToken()
          router.replace("/vendor")
        }}
        className="border rounded-sm px-3 py-2 text-sm"
      >
        Log out
      </button>
    </div>
  )
}
