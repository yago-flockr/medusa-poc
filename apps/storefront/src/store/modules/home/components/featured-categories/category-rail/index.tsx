import { listProducts } from "@/store/lib/data/products"
import { HttpTypes } from "@medusajs/types"

import InteractiveLink from "@/store/modules/common/components/interactive-link"
import ProductPreview from "@/store/modules/products/components/product-preview"

export default async function CategoryRail({
  category,
  region,
}: {
  category: HttpTypes.StoreProductCategory
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      category_id: category.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts?.length) {
    return null
  }

  return (
    <div className="container py-12 sm:py-24">
      <div className="mb-8 flex justify-between">
        <span className="text-xl font-medium">{category.name}</span>
        <InteractiveLink href={`/categories/${category.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="flex flex-wrap gap-4">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
