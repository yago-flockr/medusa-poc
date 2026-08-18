import { VendorNav } from "./vendor-nav"

export const metadata = {
  title: "Vendor portal",
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <VendorNav />
      {children}
    </div>
  )
}
