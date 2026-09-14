import { Skeleton } from "@/components/ui/skeleton"

const SkeletonCodeForm = () => {
  return (
    <div className="flex w-full flex-col">
      <Skeleton className="mb-4 h-7 w-24" />
      <div className="grid grid-cols-[1fr_80px] gap-x-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  )
}

export default SkeletonCodeForm
