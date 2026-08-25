"use client"

import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/profile", label: "Profile" },
  { href: "/vendor/orders", label: "Orders" },
]

export function VendorNav() {
  const router = useRouter()
  const clearToken = useVendorAuthStore((state) => state.clearToken)

  return (
    <nav className="flex items-center justify-between border-b pb-4 mb-6">
      <div className="flex items-center gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          clearToken()
          router.replace("/vendor")
        }}
      >
        Log out
      </Button>
    </nav>
  )
}
