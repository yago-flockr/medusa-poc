"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { clearVendorToken, getVendorToken } from "./api"

export function VendorNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)

  // Layouts stay mounted across navigations within them, so this re-checks
  // on every route change rather than only once on first mount — otherwise
  // the nav wouldn't notice a login or logout that happened on a sub-page.
  useEffect(() => {
    setAuthenticated(Boolean(getVendorToken()))
  }, [pathname])

  const handleLogout = () => {
    clearVendorToken()
    router.push("/vendor")
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-xl font-semibold">
        <Link href="/vendor">Vendor portal</Link>
      </h1>
      {authenticated && (
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/vendor/products">Products</Link>
          <Link href="/vendor/orders">Orders</Link>
          <button onClick={handleLogout} className="underline">
            Log out
          </button>
        </nav>
      )}
    </header>
  )
}
