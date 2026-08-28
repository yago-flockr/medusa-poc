import { Metadata } from "next"

import { listCollections } from "@/store/lib/data/collections"
import { getRegion } from "@/store/lib/data/regions"
import FeaturedProducts from "@/store/modules/home/components/featured-products"
import Hero from "@/store/modules/home/components/hero"

export const metadata: Metadata = {
  title: "Store",
  description: "Shop the collection.",
}

export default async function Home(props: {
  params: Promise<{ country: string }>
}) {
  const params = await props.params

  const { country } = params

  const region = await getRegion(country)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
