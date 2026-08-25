import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={cn("font-sans", inter.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
