import repeat from "@/store/lib/util/repeat"
import SkeletonProductPreview from "@/store/modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({
  numberOfProducts = 8,
}: {
  numberOfProducts?: number
}) => {
  return (
    <ul
      className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4"
      data-testid="products-list-loader"
    >
      {repeat(numberOfProducts).map((index) => (
        <li key={index}>
          <SkeletonProductPreview />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
