"use client"

import { usePostAuthAffiliateEmailpass } from "@/affiliate/hooks/mutations/auth"
import { useAffiliateAuthStore } from "@/affiliate/stores/auth-store"
import { ErrorAlert } from "@/components/display/error-alert"
import { Pitch } from "@/components/display/pitch"
import { Card } from "@/components/ui/card"
import { LoginForm } from "@/forms/login-form"
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
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-5xl gap-0 overflow-hidden p-0">
          <div className="grid lg:grid-cols-2">
            <Pitch
              className="border-b bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-10"
              title="Share what you would buy. Earn when it sells."
              description="Pick products from across every house, share your own link, and earn a share of every order that comes through it."
              cards={[
                {
                  title: "One link per product",
                  description:
                    "Copy a share link carrying your code and post it wherever your audience is.",
                },
                {
                  title: "Credit for the order",
                  description:
                    "Your code sticks to the basket, so you earn on the whole order, not just the product you shared.",
                },
              ]}
            />

            <div className="flex flex-col justify-center gap-6 p-8 lg:p-10">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-medium text-xl leading-tight sm:text-2xl">
                  Affiliate log in
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account.
                </p>
              </div>
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
              <span className="text-muted-foreground text-xs">
                Curators join by invitation only.
              </span>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return <PanelShell sidebar={<AffiliateSidebar />}>{children}</PanelShell>
}
