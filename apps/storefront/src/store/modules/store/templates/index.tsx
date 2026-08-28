import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/store/modules/store/components/refinement-list"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  country,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  country: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="container flex flex-col py-6 sm:flex-row sm:items-start"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" data-testid="store-page-title">
            All products
          </h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            country={country}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
