"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { clearVendorToken, getVendorToken } from "../api"

export default function VendorDashboardPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!getVendorToken()) {
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
          clearVendorToken()
          router.replace("/vendor")
        }}
        className="border rounded px-3 py-2 text-sm"
      >
        Log out
      </button>
    </div>
  )
}
