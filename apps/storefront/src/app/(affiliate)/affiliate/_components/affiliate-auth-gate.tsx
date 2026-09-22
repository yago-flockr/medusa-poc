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
import { usePostAuthAffiliateEmailpass } from "@/affiliate/hooks/mutations/auth"
import { useAffiliateAuthStore } from "@/affiliate/stores/auth-store"
import { useEffect, useState } from "react"

import { PanelShell } from "@/components/panel/panel-shell"
import { AffiliateSidebar } from "./affiliate-sidebar"

export function AffiliateAuthGate({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { token, setToken } = useAffiliateAuthStore()

  const postAuthAffiliateEmailpass = usePostAuthAffiliateEmailpass()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate log in</CardTitle>
            <CardDescription>
              Sign in with the credentials staff created for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              isLoading={postAuthAffiliateEmailpass.isPending}
              onSubmit={(data) =>
                postAuthAffiliateEmailpass.mutate(data, {
                  onSuccess: (data) => {
                    setToken(data.token)
                  },
                })
              }
            />
            {postAuthAffiliateEmailpass.error && (
              <ErrorAlert
                description={postAuthAffiliateEmailpass.error.message}
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <PanelShell sidebar={<AffiliateSidebar />}>{children}</PanelShell>
}
