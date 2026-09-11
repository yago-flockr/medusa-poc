import { Metadata } from "next"

import { listCategories } from "@/store/lib/data/categories"
import { listProductOptions } from "@/store/lib/data/product-options"
import { parseOptionValueIds } from "@/store/lib/util/product-option-filters"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@/store/modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    country: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)
  const categories = await listCategories({ fields: "id, handle, name" })
  const options = await listProductOptions()

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      country={params.country}
      optionValueIds={optionValueIds}
      categories={categories}
      options={options}
    />
  )
}
