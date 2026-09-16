import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { retrieveCart } from "@/store/lib/data/cart"
import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"
import { listVendors } from "@/store/lib/data/vendors"
import CartList from "@/store/modules/cart/components/cart-list"
import CartSummary from "@/store/modules/cart/components/cart-summary"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiMenuLine, RiShoppingBag4Line, RiUserLine } from "@remixicon/react"

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
      <Eyebrow variant="accent">{label}</Eyebrow>
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
  const [categories, { collections }, { vendors }, cart] = await Promise.all([
    listCategories({ fields: "id, handle, name" }),
    listCollections({ fields: "id, handle, title" }),
    listVendors(),
    retrieveCart(),
  ])

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
      <header className="relative h-20 border-b bg-background/95 backdrop-blur-md">
        <nav className="container flex h-full items-center justify-between py-0">
          <div className="flex flex-1 basis-0 items-center gap-3">
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
                    className="text-foreground"
                    data-testid="nav-account-link-mobile"
                  >
                    Profile
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/store"
                    className="text-foreground"
                  >
                    Store
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

            <LocalizedClientLink
              href="/"
              className="font-heading text-xl uppercase tracking-widest text-foreground"
              data-testid="nav-store-link"
            >
              Vitrine
            </LocalizedClientLink>
          </div>

          <NavigationMenu className="hidden md:flex" delay={100}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<LocalizedClientLink href="/store" />}
                >
                  Store
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<LocalizedClientLink href="/about" />}
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavDropdown label="Categories" items={categoryItems} />
              <NavDropdown label="Collections" items={collectionItems} />
              <NavDropdown label="Vendors" items={vendorItems} />
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 basis-0 items-center justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={
                <LocalizedClientLink
                  href="/account"
                  aria-label="Account"
                  data-testid="nav-account-link"
                />
              }
            >
              <RiUserLine />
            </Button>
            <Popover>
              <PopoverTrigger
                openOnHover
                closeDelay={200}
                nativeButton={false}
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <LocalizedClientLink
                        href="/cart"
                        aria-label="Cart"
                        data-testid="nav-cart-link"
                      />
                    }
                  >
                    <RiShoppingBag4Line />
                    <span>
                      (
                      {cart?.items?.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      ) ?? 0}
                      )
                    </span>
                  </Button>
                }
              />
              <PopoverContent
                align="end"
                className="hidden w-105 sm:block"
                data-testid="nav-cart-dropdown"
              >
                <div className="flex flex-col gap-4 p-4">
                  <CartList
                    items={cart?.items ?? []}
                    currencyCode={cart?.currency_code ?? ""}
                    className="max-h-100 overflow-y-auto"
                  />
                  {cart?.items?.length ? (
                    <CartSummary
                      subtotal={cart.subtotal ?? 0}
                      currencyCode={cart.currency_code}
                    />
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </nav>
      </header>
    </div>
  )
}
