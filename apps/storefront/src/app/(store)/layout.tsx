import { getBaseURL } from "@/lib/env"
import "@/styles/globals.css"
import { Metadata } from "next"
import { ThemeProvider } from "next-themes"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <main className="relative">{children}</main>
    </ThemeProvider>
  )
}
