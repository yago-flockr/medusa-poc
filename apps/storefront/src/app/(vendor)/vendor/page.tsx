"use client"

import { LoginForm } from "@/vendor/forms/login-form"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      <Card>
        <CardHeader>
          <CardTitle>Vendor log in</CardTitle>
          <CardDescription>
            Sign in with the credentials staff created for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
