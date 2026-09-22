"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { affiliateQueryClient } from "@/affiliate/lib/query-client"

export function AffiliateQueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={affiliateQueryClient}>
      {children}
    </QueryClientProvider>
  )
}
