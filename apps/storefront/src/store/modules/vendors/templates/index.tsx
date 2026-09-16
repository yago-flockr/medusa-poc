import { Suspense } from "react"

import { StoreVendorWithProducts } from "@/store/lib/data/vendors"
import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import SkeletonProductGrid from "@/store/modules/skeletons/templates/skeleton-product-grid"
import CatalogFilterBar from "@/store/modules/store/components/catalog-filter-bar"
import CatalogHero from "@/store/modules/store/components/catalog-hero"
import { ProductListingLayout } from "@/store/modules/store/components/product-listing-layout"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/store/modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function VendorTemplate({
  vendor,
  sortBy,
  page,
  country,
  optionValueIds,
  options,
}: {
  vendor: StoreVendorWithProducts
  sortBy?: SortOptions
  page?: string
  country: string
  optionValueIds?: OptionValueIds
  options: HttpTypes.StoreProductOption[]
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const productsIds = vendor.products?.map((product) => product.id) ?? []

  return (
    <ProductListingLayout.Root>
      <CatalogHero
        title={vendor.storefront_content?.name ?? vendor.name}
        description={vendor.storefront_content?.description}
        imageUrl={vendor.storefront_content?.hero_image_url}
        titleTestId="vendor-page-title"
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
