import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"

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
    <div className="flex flex-col gap-y-2">
      <span className="font-medium text-foreground">{title}</span>
      <ul
        className={cn("grid grid-cols-1 gap-2 text-muted-foreground", className)}
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

  return (
    <footer className="w-full border-t">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <LocalizedClientLink
              href="/"
              className="font-heading text-xl text-muted-foreground hover:text-foreground"
            >
              Vitrine
            </LocalizedClientLink>
            <p className="mt-4 text-sm text-muted-foreground">
              A marketplace where every product is reviewed before it&apos;s
              listed.
            </p>
          </div>
          {productCategories && productCategories?.length > 0 && (
            <FooterSection title="Categories" data-testid="footer-categories">
              {productCategories?.slice(0, 6).map((category) => (
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
              {collections?.slice(0, 6).map((collection) => (
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
        </div>
        <div className="mt-8 border-t pt-8 text-xs font-medium text-muted-foreground">
          © {new Date().getFullYear()} Vitrine. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
