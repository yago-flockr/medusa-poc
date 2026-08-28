"use client"

import { useState } from "react"
import { RiMenuLine } from "@remixicon/react"

import { Locale } from "@/store/lib/data/locales"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        data-testid="nav-menu-button"
        className="flex h-full items-center hover:text-foreground"
      >
        <RiMenuLine size={18} />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent className="justify-between">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ul className="flex flex-1 flex-col items-start justify-center gap-6">
          {Object.entries(SideMenuItems).map(([name, href]) => (
            <li key={name}>
              <LocalizedClientLink
                href={href}
                className="text-2xl font-medium hover:text-muted-foreground"
                onClick={() => setOpen(false)}
                data-testid={`${name.toLowerCase()}-link`}
              >
                {name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-y-4">
          <Separator />
          {!!locales?.length && (
            <LanguageSelect locales={locales} currentLocale={currentLocale} />
          )}
          {regions && <CountrySelect regions={regions} />}
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Store. All rights reserved.
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SideMenu
