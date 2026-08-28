import repeat from "@/store/lib/util/repeat"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HttpTypes } from "@medusajs/types"

import Item from "@/store/modules/cart/components/item"
import SkeletonLineItem from "@/store/modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="flex items-center pb-3">
        <h1 className="text-[2rem] leading-[2.75rem] font-semibold">Cart</h1>
      </div>
      <Table>
        <TableHeader className="border-t-0">
          <TableRow className="font-medium text-muted-foreground">
            <TableHead className="!pl-0">Item</TableHead>
            <TableHead></TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="hidden sm:table-cell">Price</TableHead>
            <TableHead className="!pr-0 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ItemsTemplate
