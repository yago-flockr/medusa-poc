import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"
import { cn } from "@/lib/utils"

import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t">
      <div className="container flex w-full flex-col">
        <div className="flex flex-col items-start justify-between gap-y-6 py-16 sm:flex-row">
          <div>
            <LocalizedClientLink
              href="/"
              className="text-lg font-semibold uppercase text-muted-foreground hover:text-foreground"
            >
              Store
            </LocalizedClientLink>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 md:gap-x-16">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-medium text-foreground">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-muted-foreground"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={cn(
                            "hover:text-foreground",
                            children && "font-medium",
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="ml-3 grid grid-cols-1 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-foreground"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-medium text-foreground">
                  Collections
                </span>
                <ul
                  className={cn(
                    "grid grid-cols-1 gap-2 text-muted-foreground",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    },
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-foreground"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="mb-16 flex w-full text-muted-foreground">
          <span className="text-sm">
            © {new Date().getFullYear()} Store. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
