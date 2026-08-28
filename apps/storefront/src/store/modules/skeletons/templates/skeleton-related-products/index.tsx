import repeat from "@/store/lib/util/repeat"
import SkeletonProductPreview from "@/store/modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="container">
      <div className="mb-8 flex flex-col items-center gap-8 text-center">
        <div className="h-6 w-20 animate-pulse bg-muted"></div>
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-96 animate-pulse bg-muted"></div>
          <div className="h-10 w-48 animate-pulse bg-muted"></div>
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
