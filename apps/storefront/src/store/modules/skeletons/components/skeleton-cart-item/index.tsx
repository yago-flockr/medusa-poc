import { TableCell, TableRow } from "@/components/ui/table"

const SkeletonCartItem = () => {
  return (
    <TableRow className="m-4 w-full">
      <TableCell className="w-24 p-4 pl-0!">
        <div className="h-24 w-24 animate-pulse rounded-lg bg-muted p-4" />
      </TableCell>
      <TableCell className="text-left">
        <div className="flex flex-col gap-y-2">
          <div className="h-4 w-32 animate-pulse bg-muted" />
          <div className="h-4 w-24 animate-pulse bg-muted" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-6 animate-pulse bg-muted" />
          <div className="h-10 w-14 animate-pulse bg-muted" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <div className="h-6 w-12 animate-pulse bg-muted" />
        </div>
      </TableCell>
      <TableCell className="pr-0! text-right">
        <div className="flex justify-end gap-2">
          <div className="h-6 w-12 animate-pulse bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default SkeletonCartItem
