"use client"

import { ErrorAlert } from "@/components/display/error-alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VendorNav } from "@/vendor/components/nav"
import { LoginForm } from "@/vendor/forms/login-form"
import { usePostAuthVendorEmailpass } from "@/vendor/hooks/mutations/auth"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { useEffect, useState } from "react"

export function VendorAuthGate({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { token, setToken } = useVendorAuthStore()

  const postAuthVendorEmailpass = usePostAuthVendorEmailpass()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null

  if (!token) {
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
              isLoading={postAuthVendorEmailpass.isPending}
              onSubmit={(data) =>
                postAuthVendorEmailpass.mutate(data, {
                  onSuccess: (data) => {
                    setToken(data.token)
                  },
                })
              }
            />
            {postAuthVendorEmailpass.error && (
              <ErrorAlert description={postAuthVendorEmailpass.error.message} />
            )}
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
