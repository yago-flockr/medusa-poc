import { listProducts } from "@/store/lib/data/products"
import { HttpTypes } from "@medusajs/types"

import InteractiveLink from "@/store/modules/common/components/interactive-link"
import ProductPreview from "@/store/modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="container py-12 sm:py-24">
      <div className="mb-8 flex justify-between">
        <span className="text-xl font-medium">{collection.title}</span>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="flex flex-wrap gap-4">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
