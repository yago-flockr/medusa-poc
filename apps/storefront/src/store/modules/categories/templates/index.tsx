import { notFound } from "next/navigation"
import { Suspense } from "react"

import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import InteractiveLink from "@/store/modules/common/components/interactive-link"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/store/modules/store/components/refinement-list"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  country,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  country: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !country) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="container flex flex-col py-6 sm:flex-row sm:items-start"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        data-testid="sort-by-container"
        hideOptionsPicker
      />
      <div className="w-full">
        <div className="mb-8 flex flex-row gap-4 text-2xl font-semibold">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-muted-foreground">
                <LocalizedClientLink
                  className="mr-4 hover:text-foreground"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8">
            <p>{category.description}</p>
          </div>
        )}
        {category.category_children && (
          <div className="mb-8">
            <ul className="grid grid-cols-1 gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            country={country}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
