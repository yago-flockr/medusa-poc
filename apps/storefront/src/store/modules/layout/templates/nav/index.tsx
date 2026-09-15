import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"
import { listVendors } from "@/store/lib/data/vendors"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import CartDropdownServer from "@/store/modules/layout/components/cart-dropdown/server"
import { RiMenuLine, RiShoppingCartLine } from "@remixicon/react"

type NavDropdownItem = {
  id: string
  href: string
  label: string
}

function NavDropdown({
  label,
  items,
}: {
  label: string
  items: NavDropdownItem[]
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-56 gap-1">
          {items.map((item) => (
            <li key={item.id}>
              <NavigationMenuLink
                render={<LocalizedClientLink href={item.href} />}
              >
                {item.label}
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

function MobileNavSection({
  label,
  items,
}: {
  label: string
  items: NavDropdownItem[]
}) {
  if (!items.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground">{label}</span>
      <ul className="flex flex-col gap-2 text-muted-foreground">
        {items.map((item) => (
          <li key={item.id}>
            <LocalizedClientLink
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function Nav() {
  const categories = await listCategories({ fields: "id, handle, name" })
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const { vendors } = await listVendors()

  const categoryItems = categories.map((category) => ({
    id: category.id,
    href: `/categories/${category.handle}`,
    label: category.name,
  }))
  const collectionItems = collections.map((collection) => ({
    id: collection.id,
    href: `/collections/${collection.handle}`,
    label: collection.title,
  }))
  const vendorItems = vendors.map((vendor) => ({
    id: vendor.id,
    href: `/vendors/${vendor.handle}`,
    label: vendor.name,
  }))

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 border-b bg-background">
        <nav className="container flex h-full items-center justify-between py-0 text-sm text-muted-foreground">
          <div className="flex h-full flex-1 basis-0 items-center gap-4">
            <NavigationMenu className="hidden h-full md:flex" delay={100}>
              <NavigationMenuList>
                <NavDropdown label="Categories" items={categoryItems} />
                <NavDropdown label="Collections" items={collectionItems} />
                <NavDropdown label="Vendors" items={vendorItems} />
              </NavigationMenuList>
            </NavigationMenu>

            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <RiMenuLine />
                  </Button>
                }
              />
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 overflow-y-auto p-6 pt-0">
                  <LocalizedClientLink
                    href="/account"
                    className="font-medium text-foreground hover:text-foreground"
                    data-testid="nav-account-link-mobile"
                  >
                    Account
                  </LocalizedClientLink>
                  <MobileNavSection label="Categories" items={categoryItems} />
                  <MobileNavSection
                    label="Collections"
                    items={collectionItems}
                  />
                  <MobileNavSection label="Vendors" items={vendorItems} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex h-full items-center">
            <LocalizedClientLink
              href="/"
              className="font-heading text-xl hover:text-foreground"
              data-testid="nav-store-link"
            >
              Vitrine
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6">
            <div className="hidden h-full items-center md:flex">
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
                    <RiShoppingCartLine />
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
