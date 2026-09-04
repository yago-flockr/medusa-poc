"use client"

import { ThemeToggle } from "@/components/display/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { RiLogoutCircleLine, RiRefreshLine } from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

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
  const queryClient = useQueryClient()
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
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            queryClient.clear()
          }}
        >
          <RiRefreshLine />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            clearToken()
            router.replace("/vendor")
          }}
        >
          <RiLogoutCircleLine />
        </Button>
      </div>
    </nav>
  )
}
