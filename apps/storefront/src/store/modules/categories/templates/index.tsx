import { notFound } from "next/navigation"
import { Fragment, Suspense } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { StoreProductCategoryWithStorefrontContent } from "@/store/lib/data/categories"
import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
import CatalogHero from "@/store/modules/store/components/catalog-hero"
import { ProductListingLayout } from "@/store/modules/store/components/product-listing-layout"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

const collectCategoryIds = (
  category: HttpTypes.StoreProductCategory,
): string[] => [
  category.id,
  ...(category.category_children?.flatMap(collectCategoryIds) ?? []),
]

function CategoryBreadcrumb({
  parents,
}: {
  parents: HttpTypes.StoreProductCategory[]
}) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {parents.map((parent) => (
          <Fragment key={parent.id}>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function SubcategoryList({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  return (
    <div className="flex flex-wrap gap-2 pb-4">
      {categories.map((subcategory) => (
        <Badge
          key={subcategory.id}
          variant="outline"
          render={
            <LocalizedClientLink href={`/categories/${subcategory.handle}`} />
          }
        >
          {subcategory.name}
        </Badge>
      ))}
    </div>
  )
}

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  country,
  optionValueIds,
  options,
}: {
  category: StoreProductCategoryWithStorefrontContent
  sortBy?: SortOptions
  page?: string
  country: string
  optionValueIds?: OptionValueIds
  options: HttpTypes.StoreProductOption[]
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

  const categoryIds = collectCategoryIds(category)

  return (
    <ProductListingLayout.Root data-testid="category-container">
      {parents.length > 0 && <CategoryBreadcrumb parents={parents} />}
      <CatalogHero
        title={category.storefront_content?.name ?? category.name}
        description={
          category.storefront_content?.description ?? category.description
        }
        imageUrl={category.storefront_content?.hero_image_url}
        titleTestId="category-page-title"
      />
      <CatalogFilterBar options={options} sortBy={sort} />
      {category.category_children && category.category_children.length > 0 && (
        <SubcategoryList categories={category.category_children} />
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
          categoryId={categoryIds}
          country={country}
          optionValueIds={optionValueIds}
        />
      </Suspense>
    </ProductListingLayout.Root>
  )
}
