import { Skeleton } from "@/components/ui/skeleton"

const SkeletonCardDetails = () => {
  return (
    <div className="my-4 flex flex-col gap-1 transition-all duration-150 ease-in-out">
      <Skeleton className="mb-1 h-4 w-1/4 rounded-md" />
      <Skeleton className="mt-0 block h-11 w-full appearance-none rounded-md border border-input px-4 pt-3 pb-1" />
    </div>
  )
}

export default SkeletonCardDetails
