import { Eyebrow } from "@/components/ui/eyebrow"
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
import { listAffiliates } from "@/store/lib/data/affiliates"
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
      <Eyebrow variant="accent">{title}</Eyebrow>
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
  const { affiliates } = await listAffiliates()

  return (
    <footer className="w-full border-t">
      <div className="container flex flex-col gap-20">
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-6">
            <LocalizedClientLink
              href="/"
              className="font-heading text-xl uppercase tracking-widest text-foreground"
            >
              Vitrine
            </LocalizedClientLink>
            <p className="text-sm text-muted-foreground">
              A marketplace where every house is chosen by invitation.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              <Eyebrow variant="accent">Correspondence</Eyebrow>
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
          {affiliates && affiliates.length > 0 && (
            <FooterSection title="Curators">
              {affiliates.slice(0, 6).map((affiliate) => (
                <li key={affiliate.id}>
                  <FooterLink href={`/affiliates/${affiliate.handle}`}>
                    {affiliate.storefront_content?.name ?? affiliate.name}
                  </FooterLink>
                </li>
              ))}
            </FooterSection>
          )}
        </div>

        <div className="border-t pt-8">
          <Eyebrow>
            © {new Date().getFullYear()} Vitrine. All rights reserved.
          </Eyebrow>
        </div>
      </div>
    </footer>
  )
}
