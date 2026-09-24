"use client"

import { ErrorAlert } from "@/components/display/error-alert"
import { TitleDescription } from "@/components/display/title-description"
import { Card } from "@/components/ui/card"
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
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-5xl gap-0 overflow-hidden p-0">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col gap-6 border-b bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-10">
              <h1 className="font-heading text-3xl leading-tight sm:text-4xl">
                Your house, your catalogue, our storefront.
              </h1>
              <p className="text-muted-foreground">
                Sell alongside every other house under one storefront. One
                basket, one payment, one checkout — and your share of every sale
                recorded the moment an order is placed.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TitleDescription
                  title="Publish it yourself"
                  description="Add products, prices and stock. They reach customers without waiting on anyone."
                />
                <TitleDescription
                  title="Only your orders"
                  description="Each order splits per house. You see your part, never anyone else's."
                />
                <TitleDescription
                  title="Earnings you can check"
                  description="What you sold, what commission was taken and what you earned, per order."
                />
                <TitleDescription
                  title="Bring your own store"
                  description="Connect Shopify and your products sync across instead of being retyped."
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 lg:p-10">
              <TitleDescription
                title="Vendor log in"
                description="Sign in to your account."
              />
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
                <ErrorAlert
                  description={postAuthVendorEmailpass.error.message}
                />
              )}
              <span className="text-muted-foreground text-xs">
                Houses join by invitation only.
              </span>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return <PanelShell sidebar={<VendorSidebar />}>{children}</PanelShell>
}
