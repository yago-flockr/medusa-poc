import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

const SkeletonLineItem = () => {
  return (
    <TableRow>
      <TableCell className="w-24">
        <Skeleton className="h-24 w-24 p-4" />
      </TableCell>
      <TableCell>
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
      <TableCell>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-6 w-12" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default SkeletonLineItem
