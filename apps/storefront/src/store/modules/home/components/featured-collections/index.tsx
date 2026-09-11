import { HttpTypes } from "@medusajs/types"

import ThumbnailCard from "@/store/modules/common/components/thumbnail-card"

export default function FeaturedCollections({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) {
  if (!collections.length) {
    return null
  }

  return (
    <div className="container py-12 sm:py-24">
      <p className="mb-6 font-heading text-2xl">Curated collections</p>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.id}>
            <ThumbnailCard
              href={`/collections/${collection.handle}`}
              title={collection.title}
              className="aspect-4/5"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
