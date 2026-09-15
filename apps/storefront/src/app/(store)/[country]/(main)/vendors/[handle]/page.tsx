import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getVendorByHandle, listVendors } from "@/store/lib/data/vendors"
import { listProductOptions } from "@/store/lib/data/product-options"
import { listRegions } from "@/store/lib/data/regions"
import { parseOptionValueIds } from "@/store/lib/util/product-option-filters"
import VendorTemplate from "@/store/modules/vendors/templates"
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
  const { vendors } = await listVendors()

  if (!vendors) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[],
  )

  const vendorHandles = vendors.map((vendor) => vendor.handle)

  const staticParams = countryCodes
    ?.map((country: string) =>
      vendorHandles.map((handle: string) => ({
        country,
        handle,
      })),
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const vendor = await getVendorByHandle(params.handle)

  if (!vendor) {
    notFound()
  }

  const title = vendor.storefront_content?.name ?? vendor.name

  return {
    title: `${title} | Store`,
    description:
      vendor.storefront_content?.description ?? `${title} products.`,
  }
}

export default async function VendorPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const vendor = await getVendorByHandle(params.handle)

  if (!vendor) {
    notFound()
  }

  const options = await listProductOptions()

  return (
    <VendorTemplate
      vendor={vendor}
      page={page}
      sortBy={sortBy}
      country={params.country}
      optionValueIds={optionValueIds}
      options={options}
    />
  )
}
