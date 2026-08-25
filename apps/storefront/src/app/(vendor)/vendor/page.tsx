"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useVendorAuthStore } from "@vendor/lib/auth-store"
import { LoginForm } from "@vendor/forms/login-form"

export default function VendorHomePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (useVendorAuthStore.getState().token) {
      router.replace("/vendor/dashboard")
      return
    }
    setChecked(true)
  }, [router])

  if (!checked) {
    return null
  }

  return (
    <div className="max-w-sm">
      <LoginForm />
    </div>
  )
}
