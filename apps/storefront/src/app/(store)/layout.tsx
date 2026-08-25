import { getBaseURL } from "@/store/lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

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
