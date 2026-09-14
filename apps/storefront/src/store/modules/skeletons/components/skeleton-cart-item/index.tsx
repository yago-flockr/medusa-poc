import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

const SkeletonCartItem = () => {
  return (
    <TableRow className="m-4 w-full">
      <TableCell className="w-24 p-4 pl-0!">
        <Skeleton className="h-24 w-24 rounded-lg p-4" />
      </TableCell>
      <TableCell className="text-left">
        <div className="flex flex-col gap-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-6" />
          <Skeleton className="h-10 w-14" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12" />
        </div>
      </TableCell>
      <TableCell className="pr-0! text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-6 w-12" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default SkeletonCartItem
