import { Suspense } from "react"

import { StoreCollectionWithStorefrontContent } from "@/store/lib/data/collections"
import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
import CatalogHero from "@/store/modules/store/components/catalog-hero"
import { ProductListingLayout } from "@/store/modules/store/components/product-listing-layout"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  country,
  optionValueIds,
  options,
}: {
  sortBy?: SortOptions
  collection: StoreCollectionWithStorefrontContent
  page?: string
  country: string
  optionValueIds?: OptionValueIds
  options: HttpTypes.StoreProductOption[]
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <ProductListingLayout.Root>
      <CatalogHero
        title={collection.storefront_content?.name ?? collection.title}
        description={collection.storefront_content?.description}
        imageUrl={collection.storefront_content?.hero_image_url}
        titleTestId="collection-page-title"
      />
      <CatalogFilterBar options={options} sortBy={sort} />
      <Suspense
        fallback={
          <SkeletonProductGrid numberOfProducts={collection.products?.length} />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          collectionId={collection.id}
          country={country}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </ProductListingLayout.Root>
  )
}
