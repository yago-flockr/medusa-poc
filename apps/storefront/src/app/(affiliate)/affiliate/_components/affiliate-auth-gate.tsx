"use client"

import { ErrorAlert } from "@/components/display/error-alert"
import { TitleDescription } from "@/components/display/title-description"
import { Card } from "@/components/ui/card"
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
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-5xl gap-0 overflow-hidden p-0">
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col gap-6 border-b bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-10">
              <h1 className="font-heading text-3xl leading-tight sm:text-4xl">
                Share what you would buy. Earn when it sells.
              </h1>
              <p className="text-muted-foreground">
                Pick products from across every house, share your own link, and
                earn a share of every order that comes through it.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TitleDescription
                  title="Choose your picks"
                  description="Search the whole catalogue and promote anything you would stand behind."
                />
                <TitleDescription
                  title="One link per product"
                  description="Copy a share link carrying your code and post it wherever your audience is."
                />
                <TitleDescription
                  title="Credit for the order"
                  description="Your code sticks to the basket, so you earn on the whole order, not just the product you shared."
                />
                <TitleDescription
                  title="Your own page"
                  description="Everything you promote gets a page on the storefront under your name."
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 lg:p-10">
              <TitleDescription
                title="Affiliate log in"
                description="Sign in to your account."
              />
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
