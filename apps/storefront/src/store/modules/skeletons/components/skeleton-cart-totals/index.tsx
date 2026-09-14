import { Skeleton } from "@/components/ui/skeleton"

const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col">
      {header && <Skeleton className="mb-4 h-4 w-32" />}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-32" />
      </div>

      <div className="my-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="my-4 w-full border-b border-dashed border-border" />

      <div className="flex items-center justify-between">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-4 h-6 w-24" />
      </div>
    </div>
  )
}

export default SkeletonCartTotals
