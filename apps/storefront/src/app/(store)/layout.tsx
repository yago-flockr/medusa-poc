import { getBaseURL } from "@/store/lib/util/env"
import "@/styles/globals.css"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="relative">{children}</main>
}
