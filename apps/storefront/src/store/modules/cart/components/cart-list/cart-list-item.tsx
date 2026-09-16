import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import DeleteButton from "@/store/modules/common/components/delete-button"
import LineItemOptions from "@/store/modules/common/components/line-item-options"
import LineItemPrice from "@/store/modules/common/components/line-item-price"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { Thumbnail } from "@/components/ui/thumbnail"
import { HttpTypes } from "@medusajs/types"

export default function CartListItem({
  item,
  currencyCode,
  className,
  ...props
}: ComponentProps<"li"> & {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}) {
  return (
    <li
      className={cn("flex gap-4", className)}
      data-testid="cart-item"
      {...props}
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="w-24 shrink-0"
      >
        <Thumbnail
          src={item.thumbnail ?? item.variant?.product?.images?.[0]?.url}
          alt={item.title}
          ratio="square"
        />
      </LocalizedClientLink>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col text-sm">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              data-testid="product-link"
            >
              {item.title}
            </LocalizedClientLink>
            <LineItemOptions
              variant={item.variant}
              data-testid="cart-item-variant"
              data-value={item.variant}
            />
            <span
              className="text-muted-foreground"
              data-testid="cart-item-quantity"
              data-value={item.quantity}
            >
              Quantity: {item.quantity}
            </span>
          </div>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
        <DeleteButton id={item.id} data-testid="cart-item-remove-button">
          Remove
        </DeleteButton>
      </div>
    </li>
  )
}
