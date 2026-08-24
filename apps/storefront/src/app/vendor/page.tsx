"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getVendorToken } from "./api"
import { LoginForm } from "./login-form"

export default function VendorHomePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (getVendorToken()) {
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
