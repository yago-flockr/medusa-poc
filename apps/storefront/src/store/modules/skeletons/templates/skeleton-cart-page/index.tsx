import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import repeat from "@/store/lib/util/repeat"
import SkeletonCartItem from "@/store/modules/skeletons/components/skeleton-cart-item"
import SkeletonCodeForm from "@/store/modules/skeletons/components/skeleton-code-form"
import SkeletonOrderSummary from "@/store/modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-x-40 sm:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-y-6 bg-background p-6">
            <div className="flex items-start justify-between bg-background">
              <div className="flex flex-col gap-y-2">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div>
                <Skeleton className="h-8 w-14" />
              </div>
            </div>
            <div>
              <div className="flex items-center pb-3">
                <Skeleton className="h-12 w-20" />
              </div>
              <Table>
                <TableHeader className="border-t-0">
                  <TableRow>
                    <TableHead className="pl-0!">
                      <Skeleton className="h-6 w-10" />
                    </TableHead>
                    <TableHead></TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-16" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-6 w-12" />
                    </TableHead>
                    <TableHead className="pr-0!">
                      <div className="flex justify-end">
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repeat(4).map((index) => (
                    <SkeletonCartItem key={index} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex flex-col gap-y-8">
            <SkeletonOrderSummary />
            <SkeletonCodeForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
