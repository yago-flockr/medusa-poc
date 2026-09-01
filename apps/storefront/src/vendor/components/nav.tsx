"use client"

import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/profile", label: "Profile" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/locations", label: "Locations" },
  { href: "/vendor/shopify", label: "Shopify" },
]

export function VendorNav() {
  const router = useRouter()
  const pathname = usePathname()
  const clearToken = useVendorAuthStore((state) => state.clearToken)

  return (
    <nav className="flex items-center justify-between border-b pb-4 mb-6">
      <div className="flex items-center gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground",
              pathname === item.href && "text-foreground font-bold",
            )}
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
