import { HttpTypes } from "@medusajs/types"

import ThumbnailCard from "@/store/modules/common/components/thumbnail-card"

export default function FeaturedCategories({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <div className="container py-12 sm:py-24">
      <p className="mb-6 font-heading text-2xl">Shop by category</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((category) => (
          <li key={category.id}>
            <ThumbnailCard
              href={`/categories/${category.handle}`}
              title={category.name}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
