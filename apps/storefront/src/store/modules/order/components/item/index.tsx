import { TableCell, TableRow } from "@/components/ui/table"
import { HttpTypes } from "@medusajs/types"

import LineItemOptions from "@/store/modules/common/components/line-item-options"
import LineItemPrice from "@/store/modules/common/components/line-item-price"
import LineItemUnitPrice from "@/store/modules/common/components/line-item-unit-price"
import Thumbnail from "@/store/modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <TableRow className="w-full" data-testid="product-row">
      <TableCell className="w-24 p-4 !pl-0">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </TableCell>

      <TableCell className="text-left">
        <span className="font-medium" data-testid="product-name">
          {item.product_title}
        </span>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </TableCell>

      <TableCell className="!pr-0">
        <span className="flex h-full flex-col items-end justify-center !pr-0">
          <span className="flex gap-x-1">
            <span className="text-muted-foreground">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </TableCell>
    </TableRow>
  )
}

export default Item
