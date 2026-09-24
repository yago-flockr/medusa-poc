import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
import CatalogHero from "@/store/modules/store/components/catalog-hero"
import { ProductListingLayout } from "@/store/modules/store/components/product-listing-layout"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CatalogTemplate({
  title,
  description,
  imageUrl,
  productsIds,
  titleTestId,
  sortBy,
  page,
  country,
  optionValueIds,
  options,
}: {
  title: string
  description?: string | null
  imageUrl?: string | null
  productsIds: string[]
  titleTestId?: string
  sortBy?: SortOptions
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
        title={title}
        description={description}
        imageUrl={imageUrl}
        titleTestId={titleTestId}
      />
      <CatalogFilterBar options={options} sortBy={sort} />
      <Suspense
        fallback={
          <SkeletonProductGrid numberOfProducts={productsIds.length || 8} />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          productsIds={productsIds}
          country={country}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </ProductListingLayout.Root>
  )
}
