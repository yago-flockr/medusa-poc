import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StoreCollectionWithStorefrontContent } from "@/store/lib/data/collections"
import { listProducts } from "@/store/lib/data/products"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import ProductPreview from "@/store/modules/products/components/product-preview"
import { RiArrowRightLine } from "@remixicon/react"

const SHELF_PRODUCT_COUNT = 4

export default async function FeaturedCollections({
  collections,
  countryCode,
  className,
  ...props
}: ComponentProps<"section"> & {
  collections: StoreCollectionWithStorefrontContent[]
  countryCode: string
}) {
  const collection = collections[0]

  if (!collection) {
    return null
  }

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit: SHELF_PRODUCT_COUNT,
    },
  })

  if (!response.products.length) {
    return null
  }

  return (
    <section
      className={cn("container flex flex-col gap-10", className)}
      {...props}
    >
      <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-xs uppercase tracking-widest text-primary">
            Curated shelf
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl">
            {collection.storefront_content?.name ?? collection.title}
          </h2>
          {collection.storefront_content?.description && (
            <p className="text-sm text-muted-foreground">
              {collection.storefront_content.description}
            </p>
          )}
        </div>
        <Button
          variant="link"
          nativeButton={false}
          render={
            <LocalizedClientLink href={`/collections/${collection.handle}`} />
          }
        >
          View all {response.count} {response.count === 1 ? "edit" : "edits"}
          <RiArrowRightLine data-icon="inline-end" />
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {response.products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
