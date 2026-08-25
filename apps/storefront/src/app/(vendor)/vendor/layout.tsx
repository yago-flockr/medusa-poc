import { Metadata } from "next"
import "@/styles/globals.css"
import { VendorQueryClientProvider } from "./_components/query-client-provider"
import { VendorAuthGate } from "./_components/vendor-auth-gate"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000",
  ),
  title: "Vendor panel",
  robots: { index: false, follow: false },
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VendorQueryClientProvider>
      <VendorAuthGate>{children}</VendorAuthGate>
    </VendorQueryClientProvider>
  )
}
