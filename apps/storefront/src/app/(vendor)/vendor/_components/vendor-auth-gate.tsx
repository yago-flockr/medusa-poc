"use client"

import { ErrorAlert } from "@/components/display/error-alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/forms/login-form"

import { PanelShell } from "@/components/panel/panel-shell"
import { VendorSidebar } from "./vendor-sidebar"
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

  return <PanelShell sidebar={<VendorSidebar />}>{children}</PanelShell>
}
