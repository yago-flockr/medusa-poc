"use client"

import repeat from "@/store/lib/util/repeat"
import { Table, TableBody } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"

import Item from "@/store/modules/cart/components/item"
import SkeletonLineItem from "@/store/modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={cn({
        "max-h-[420px] overflow-x-hidden overflow-y-scroll pl-[1px]":
          hasOverflow,
      })}
    >
      <Table>
        <TableBody data-testid="items-table">
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
                      type="preview"
                      currencyCode={cart.currency_code}
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

export default ItemsPreviewTemplate
