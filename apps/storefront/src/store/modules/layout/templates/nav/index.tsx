import { Suspense } from "react"

import { getLocale } from "@/store/lib/data/locale-actions"
import { listLocales } from "@/store/lib/data/locales"
import { listRegions } from "@/store/lib/data/regions"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import CartButton from "@/store/modules/layout/components/cart-button"
import SideMenu from "@/store/modules/layout/components/side-menu"
import { StoreRegion } from "@medusajs/types"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 border-b bg-background">
        <nav className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
          <div className="flex h-full flex-1 basis-0 items-center">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
            />
          </div>

          <div className="flex h-full items-center">
            <LocalizedClientLink
              href="/"
              className="text-lg font-semibold uppercase hover:text-foreground"
              data-testid="nav-store-link"
            >
              Store
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6">
            <div className="hidden sm:flex h-full items-center gap-x-6">
              <LocalizedClientLink
                className="hover:text-foreground"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <div className="flex items-center h-full">
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="flex gap-2 hover:text-foreground"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Cart (0)
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
