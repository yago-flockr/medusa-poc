import { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { RiShoppingBagLine } from "@remixicon/react"

import CartListItem from "./cart-list-item"

export default function CartList({
  items,
  currencyCode,
  className,
  ...props
}: ComponentProps<"div"> & {
  items: HttpTypes.StoreCartLineItem[]
  currencyCode: string
}) {
  return (
    <div className={className} {...props}>
      {items.length ? (
        <ul className="flex flex-col gap-6">
          {[...items]
            .sort((a, b) =>
              (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1,
            )
            .map((item) => (
              <CartListItem
                key={item.id}
                item={item}
                currencyCode={currencyCode}
              />
            ))}
        </ul>
      ) : (
        <Empty className="border-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiShoppingBagLine />
            </EmptyMedia>
            <EmptyDescription>Your shopping bag is empty.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              nativeButton={false}
              render={<LocalizedClientLink href="/store" />}
            >
              Explore products
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
