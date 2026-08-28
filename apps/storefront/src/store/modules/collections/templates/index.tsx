import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/store/modules/store/components/refinement-list"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  country,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  country: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="container flex flex-col py-6 sm:flex-row sm:items-start">
      <RefinementList sortBy={sort} hideOptionsPicker />
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
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
      </div>
    </div>
  )
}
