import { Metadata } from "next"
import { ThemeProvider } from "next-themes"

import { getBaseURL } from "@/lib/env"
import "@/styles/globals.css"
import { VendorQueryClientProvider } from "./_components/query-client-provider"
import { VendorAuthGate } from "./_components/vendor-auth-gate"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Vendor panel",
  robots: { index: false, follow: false },
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <VendorQueryClientProvider>
        <VendorAuthGate>{children}</VendorAuthGate>
      </VendorQueryClientProvider>
    </ThemeProvider>
  )
}
