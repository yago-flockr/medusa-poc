import CategoryRail from "@/store/modules/home/components/featured-categories/category-rail"
import { HttpTypes } from "@medusajs/types"

export default async function FeaturedCategories({
  categories,
  region,
}: {
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}) {
  return categories.map((category) => (
    <li key={category.id}>
      <CategoryRail category={category} region={region} />
    </li>
  ))
}
