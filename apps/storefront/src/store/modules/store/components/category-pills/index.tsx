import { Badge } from "@/components/ui/badge"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type CategoryPillsProps = {
  categories: HttpTypes.StoreProductCategory[]
  activeCategoryId?: string
}

const CategoryPills = ({ categories, activeCategoryId }: CategoryPillsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!activeCategoryId ? "default" : "outline"}
        render={<LocalizedClientLink href="/store" />}
      >
        All
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant={activeCategoryId === category.id ? "default" : "outline"}
          render={
            <LocalizedClientLink href={`/categories/${category.handle}`} />
          }
        >
          {category.name}
        </Badge>
      ))}
    </div>
  )
}

export default CategoryPills
