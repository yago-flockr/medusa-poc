import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getCategoryByHandle,
  listCategories,
} from "@/store/lib/data/categories"
import { listRegions } from "@/store/lib/data/regions"
import { parseOptionValueIds } from "@/store/lib/util/product-option-filters"
import CategoryTemplate from "@/store/modules/categories/templates"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import { HttpTypes, StoreRegion } from "@medusajs/types"

type Props = {
  params: Promise<{ category: string[]; country: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat(),
  )

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle,
  )

  const staticParams = countryCodes
    ?.map((country: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        country,
        category: [handle],
      })),
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name

    const description =
      productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      country={params.country}
      optionValueIds={optionValueIds}
    />
  )
}
