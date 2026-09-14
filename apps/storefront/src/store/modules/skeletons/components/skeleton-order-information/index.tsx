import { Skeleton } from "@/components/ui/skeleton"
import SkeletonCartTotals from "@/store/modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderInformation = () => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 border-b border-border py-10 lg:grid-cols-2">
        <div className="flex flex-col">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-3 w-2/6" />
          <Skeleton className="my-2 h-3 w-3/6" />
          <Skeleton className="h-3 w-1/6" />
        </div>
        <div className="flex flex-col">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-3 w-2/6" />
          <Skeleton className="my-2 h-3 w-3/6" />
          <Skeleton className="h-3 w-2/6" />
          <Skeleton className="mt-2 h-3 w-1/6" />
          <Skeleton className="my-4 h-4 w-32" />
          <Skeleton className="h-3 w-1/6" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 py-10 lg:grid-cols-2">
        <div className="flex flex-col">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-3 w-2/6" />
          <Skeleton className="my-4 h-3 w-3/6" />
        </div>

        <SkeletonCartTotals />
      </div>
    </div>
  )
}

export default SkeletonOrderInformation
