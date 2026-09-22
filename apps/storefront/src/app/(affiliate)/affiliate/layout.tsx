import { Metadata } from "next"

import { getBaseURL } from "@/lib/env"
import "@/styles/globals.css"
import { AffiliateQueryClientProvider } from "./_components/query-client-provider"
import { AffiliateAuthGate } from "./_components/affiliate-auth-gate"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Affiliate panel",
  robots: { index: false, follow: false },
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AffiliateQueryClientProvider>
      <AffiliateAuthGate>{children}</AffiliateAuthGate>
    </AffiliateQueryClientProvider>
  )
}
