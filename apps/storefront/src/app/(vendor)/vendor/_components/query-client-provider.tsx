"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { vendorQueryClient } from "@/vendor/lib/query-client"

export function VendorQueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={vendorQueryClient}>
      {children}
    </QueryClientProvider>
  )
}
