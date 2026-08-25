"use client"

import { LoginForm } from "@/vendor/forms/login-form"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
