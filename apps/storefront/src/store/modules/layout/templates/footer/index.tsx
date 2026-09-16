import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"
import { listVendors } from "@/store/lib/data/vendors"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

function FooterLink({
  href,
  className,
  children,
  ...props
}: ComponentProps<typeof LocalizedClientLink>) {
  return (
    <LocalizedClientLink
      href={href}
      className={cn("hover:text-foreground", className)}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  )
}

function FooterSection({
  title,
  className,
  children,
  ...props
}: ComponentProps<"ul"> & { title: string }) {
  return (
    <div className="flex flex-col gap-y-4">
      <span className="text-xs uppercase tracking-widest text-ring">
        {title}
      </span>
      <ul
        className={cn(
          "grid grid-cols-1 gap-3 text-sm text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    </div>
  )
}

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()
  const { vendors } = await listVendors()

  return (
    <footer className="w-full border-t">
      <div className="container">
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-5">
          <div className="col-span-2">
            <LocalizedClientLink
              href="/"
              className="font-heading text-xl uppercase tracking-widest text-foreground"
            >
              Vitrine
            </LocalizedClientLink>
            <p className="mt-6 text-sm text-muted-foreground">
              A marketplace where every product is reviewed before it&apos;s
              listed.
            </p>
            <div className="mt-10 flex flex-col gap-y-4">
              <span className="text-xs uppercase tracking-widest text-ring">
                Correspondence
              </span>
              <InputGroup>
                <InputGroupInput
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton>Join</InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          {productCategories && productCategories.length > 0 && (
            <FooterSection title="Categories" data-testid="footer-categories">
              {productCategories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <FooterLink
                    href={`/categories/${category.handle}`}
                    data-testid="category-link"
                  >
                    {category.name}
                  </FooterLink>
                </li>
              ))}
            </FooterSection>
          )}
          {collections && collections.length > 0 && (
            <FooterSection title="Collections">
              {collections.slice(0, 6).map((collection) => (
                <li key={collection.id}>
                  <FooterLink
                    href={`/collections/${collection.handle}`}
                    data-testid="collection-link"
                  >
                    {collection.title}
                  </FooterLink>
                </li>
              ))}
            </FooterSection>
          )}
          {vendors && vendors.length > 0 && (
            <FooterSection title="Vendors">
              {vendors.slice(0, 6).map((vendor) => (
                <li key={vendor.id}>
                  <FooterLink href={`/vendors/${vendor.handle}`}>
                    {vendor.name}
                  </FooterLink>
                </li>
              ))}
            </FooterSection>
          )}
        </div>

        <div className="mt-20 border-t pt-8 text-xs uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} Vitrine. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
