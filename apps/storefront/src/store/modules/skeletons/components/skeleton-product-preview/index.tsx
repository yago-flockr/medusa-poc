import { Skeleton } from "@/components/ui/skeleton"

const SkeletonProductPreview = () => {
  return (
    <div>
      <Skeleton className="aspect-9/16 w-full rounded-lg border" />
      <div className="mt-3 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/5 rounded-sm" />
        <Skeleton className="h-4 w-1/5 rounded-sm" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
