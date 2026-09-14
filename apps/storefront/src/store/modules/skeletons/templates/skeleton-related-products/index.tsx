import { Skeleton } from "@/components/ui/skeleton"
import repeat from "@/store/lib/util/repeat"
import SkeletonProductPreview from "@/store/modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="container">
      <div className="mb-8 flex flex-col items-center gap-8 text-center">
        <Skeleton className="h-6 w-20" />
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
      <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
        {repeat(3).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
