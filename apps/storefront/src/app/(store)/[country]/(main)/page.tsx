import { Metadata } from "next"

import { listCategories } from "@/store/lib/data/categories"
import { listCollections } from "@/store/lib/data/collections"
import { listVendors } from "@/store/lib/data/vendors"
import FeaturedCategories from "@/store/modules/home/components/featured-categories"
import FeaturedCollections from "@/store/modules/home/components/featured-collections"
import FeaturedVendors from "@/store/modules/home/components/featured-vendors"
import Hero from "@/store/modules/home/components/hero"

export const metadata: Metadata = {
  title: "Store",
  description: "Shop the collection.",
}

export default async function Home() {
  const { collections } = await listCollections({
    fields: "+storefront_content.*",
  })
  const categories = await listCategories({
    fields: "+storefront_content.*",
  })
  const { vendors } = await listVendors()

  if (!collections) {
    return null
  }

  return (
    <>
      <Hero />
      <FeaturedCollections collections={collections} />
      <FeaturedVendors vendors={vendors} />
      <FeaturedCategories categories={categories} />
    </>
  )
}
