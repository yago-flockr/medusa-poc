import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
import CatalogHero from "@/store/modules/store/components/catalog-hero"
import { ProductListingLayout } from "@/store/modules/store/components/product-listing-layout"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  country,
  optionValueIds,
  categories,
  options,
}: {
  sortBy?: SortOptions
  page?: string
  country: string
  optionValueIds?: OptionValueIds
  categories: HttpTypes.StoreProductCategory[]
  options: HttpTypes.StoreProductOption[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <ProductListingLayout.Root data-testid="category-container">
      <CatalogHero
        eyebrow="Collection folio"
        title="The Archive"
        description="Every piece in the catalog, reviewed before it was listed."
        titleTestId="store-page-title"
      />
      <CatalogFilterBar
        categories={categories}
        options={options}
        sortBy={sort}
      />
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          country={country}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </ProductListingLayout.Root>
  )
}

export default StoreTemplate
