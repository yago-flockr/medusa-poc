import { listProductsWithSort } from "@/store/lib/data/products"
import { getRegion } from "@/store/lib/data/regions"
import { OptionValueIds } from "@/store/lib/util/product-option-filters"
import ProductPreview from "@/store/modules/products/components/product-preview"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Pagination } from "@/store/modules/store/components/pagination"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 9

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  country,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string | string[]
  productsIds?: string[]
  country: string
  optionValueIds?: OptionValueIds
}) {
  if (productsIds?.length === 0) {
    return (
      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="products-list"
      />
    )
  }

  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = Array.isArray(categoryId)
      ? categoryId
      : [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(country)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode: country,
    optionValueIds,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} />
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <Eyebrow>
          Showing {(page - 1) * PRODUCT_LIMIT + 1}&ndash;
          {Math.min(page * PRODUCT_LIMIT, count)} of {count}
        </Eyebrow>
        {totalPages > 1 && (
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
          />
        )}
      </div>
    </>
  )
}
