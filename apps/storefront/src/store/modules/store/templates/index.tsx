import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
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
    <div className="container py-6" data-testid="category-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" data-testid="store-page-title">
          All products
        </h1>
      </div>
      <CatalogFilterBar categories={categories} options={options} sortBy={sort} />
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          country={country}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
