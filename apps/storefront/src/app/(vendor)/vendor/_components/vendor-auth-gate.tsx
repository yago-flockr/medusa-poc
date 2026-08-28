"use client"

import { LoginForm, type LoginVendorInput } from "@/vendor/forms/login-form"
import { VendorNav } from "@/vendor/components/nav"
import { useLoginVendor } from "@/vendor/hooks/mutations/auth"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function VendorAuthGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const token = useVendorAuthStore((state) => state.token)
  const setToken = useVendorAuthStore((state) => state.setToken)
  const loginVendor = useLoginVendor()

  useEffect(() => {
    setChecked(true)
  }, [])

  if (!checked) {
    return null
  }

  if (!token) {
    const handleLogin = (values: LoginVendorInput) => {
      loginVendor.mutate(values, {
        onSuccess: ({ token }) => setToken(token),
      })
    }

    return (
      <div className="max-w-sm mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendor log in</CardTitle>
            <CardDescription>
              Sign in with the credentials staff created for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              isLoading={loginVendor.isPending}
              error={loginVendor.error?.message}
              onSubmit={handleLogin}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <VendorNav />
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  )
}
