"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getVendorToken } from "./api"
import { RegisterForm } from "./register-form"
import { LoginForm } from "./login-form"

export default function VendorHomePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (getVendorToken()) {
      router.replace("/vendor/products")
      return
    }
    setChecked(true)
  }, [router])

  if (!checked) {
    return null
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <RegisterForm />
      <LoginForm />
    </div>
  )
}
