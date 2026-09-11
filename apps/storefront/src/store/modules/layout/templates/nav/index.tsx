import { Suspense } from "react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { listCategories } from "@/store/lib/data/categories"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import CartDropdownServer from "@/store/modules/layout/components/cart-dropdown/server"

export default async function Nav() {
  const categories = await listCategories({ fields: "id, handle, name" })

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 border-b bg-background">
        <nav className="container flex h-full items-center justify-between py-0 text-sm text-muted-foreground">
          <div className="flex h-full flex-1 basis-0 items-center gap-4">
            <NavigationMenu className="h-full" delay={100}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Catalog</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-56 gap-1">
                      {categories.map((category) => (
                        <li key={category.id}>
                          <NavigationMenuLink
                            render={
                              <LocalizedClientLink
                                href={`/categories/${category.handle}`}
                              />
                            }
                          >
                            {category.name}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex h-full items-center">
            <LocalizedClientLink
              href="/"
              className="font-heading text-xl hover:text-foreground"
              data-testid="nav-store-link"
            >
              Vitine
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6">
            <div className="flex h-full items-center">
              <LocalizedClientLink
                className="inline-flex h-9 w-max items-center justify-center rounded-2xl px-2.5 py-1.5 text-sm font-medium transition-all hover:bg-muted"
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
                    className="inline-flex h-9 w-max items-center justify-center rounded-2xl px-2.5 py-1.5 text-sm font-medium transition-all hover:bg-muted"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Cart (0)
                  </LocalizedClientLink>
                }
              >
                <CartDropdownServer />
              </Suspense>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
