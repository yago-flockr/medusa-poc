import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getAffiliateByHandle,
  listAffiliates,
} from "@/store/lib/data/affiliates"
import { listProductOptions } from "@/store/lib/data/product-options"
import { listRegions } from "@/store/lib/data/regions"
import { parseOptionValueIds } from "@/store/lib/util/product-option-filters"
import CatalogTemplate from "@/store/modules/catalog/templates"
import { SortOptions } from "@/store/modules/store/components/refinement-list/sort-products"
import { StoreRegion } from "@medusajs/types"

type Props = {
  params: Promise<{ handle: string; country: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  const { affiliates } = await listAffiliates()

  if (!affiliates) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[],
  )

  return countryCodes
    ?.map((country: string) =>
      affiliates.map((affiliate) => ({ country, handle: affiliate.handle })),
    )
    .flat()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const affiliate = await getAffiliateByHandle(params.handle)

  if (!affiliate) {
    notFound()
  }

  const title = affiliate.storefront_content?.name ?? affiliate.name

  return {
    title: `${title} | Store`,
    description:
      affiliate.storefront_content?.description ?? `Picks from ${title}.`,
  }
}

export default async function AffiliatePage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const affiliate = await getAffiliateByHandle(params.handle)

  if (!affiliate) {
    notFound()
  }

  const options = await listProductOptions()

  return (
    <CatalogTemplate
      title={affiliate.storefront_content?.name ?? affiliate.name}
      description={affiliate.storefront_content?.description}
      imageUrl={affiliate.storefront_content?.hero_image_url}
      productsIds={affiliate.products?.map((product) => product.id) ?? []}
      titleTestId="affiliate-page-title"
      page={page}
      sortBy={sortBy}
      country={params.country}
      optionValueIds={optionValueIds}
      options={options}
    />
  )
}
