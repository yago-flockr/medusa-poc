import { Skeleton } from "@/components/ui/skeleton"
import repeat from "@/store/lib/util/repeat"

const SkeletonOrderItems = () => {
  return (
    <div className="flex flex-col gap-y-4 border-y border-border py-10">
      {repeat(3).map((index) => (
        <div key={index} className="grid grid-cols-[122px_1fr] gap-x-4">
          <Skeleton className="aspect-[29/34] w-full" />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonOrderItems
