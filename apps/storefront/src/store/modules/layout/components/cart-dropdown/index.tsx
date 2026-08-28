"use client"

import { convertToLocale } from "@/store/lib/util/money"
import DeleteButton from "@/store/modules/common/components/delete-button"
import LineItemOptions from "@/store/modules/common/components/line-item-options"
import LineItemPrice from "@/store/modules/common/components/line-item-price"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Thumbnail from "@/store/modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [open, setOpen] = useState(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      setOpen(true)
      const timer = setTimeout(() => setOpen(false), 5000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        closeDelay={200}
        nativeButton={false}
        className="hover:text-foreground"
        render={
          <LocalizedClientLink
            href="/cart"
            data-testid="nav-cart-link"
          >{`Cart (${totalItems})`}</LocalizedClientLink>
        }
      />
      <PopoverContent
        align="end"
        className="hidden w-105 sm:block"
        data-testid="nav-cart-dropdown"
      >
        <div className="flex items-center justify-center p-4">
          <h3 className="text-lg font-semibold">Cart</h3>
        </div>
        {cartState && cartState.items?.length ? (
          <>
            <div className="grid max-h-100.5 grid-cols-1 gap-y-8 overflow-y-scroll px-4">
              {cartState.items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => (
                  <div
                    className="grid grid-cols-[122px_1fr] gap-x-4"
                    key={item.id}
                    data-testid="cart-item"
                  >
                    <LocalizedClientLink
                      href={`/products/${item.product_handle}`}
                      className="w-24"
                    >
                      <Thumbnail
                        thumbnail={item.thumbnail}
                        images={item.variant?.product?.images}
                        size="square"
                      />
                    </LocalizedClientLink>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div className="mr-4 flex w-45 flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                            <h3 className="overflow-hidden text-ellipsis text-sm">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                data-testid="product-link"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </h3>
                            <LineItemOptions
                              variant={item.variant}
                              data-testid="cart-item-variant"
                              data-value={item.variant}
                            />
                            <span
                              data-testid="cart-item-quantity"
                              data-value={item.quantity}
                            >
                              Quantity: {item.quantity}
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <LineItemPrice
                              item={item}
                              style="tight"
                              currencyCode={cartState.currency_code}
                            />
                          </div>
                        </div>
                      </div>
                      <DeleteButton
                        id={item.id}
                        className="mt-1"
                        data-testid="cart-item-remove-button"
                      >
                        Remove
                      </DeleteButton>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex flex-col gap-y-4 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Subtotal <span className="font-normal">(excl. taxes)</span>
                </span>
                <span
                  className="text-lg font-semibold"
                  data-testid="cart-subtotal"
                  data-value={subtotal}
                >
                  {convertToLocale({
                    amount: subtotal,
                    currency_code: cartState.currency_code,
                  })}
                </span>
              </div>
              <LocalizedClientLink href="/cart" passHref>
                <Button className="w-full" data-testid="go-to-cart-button">
                  Go to cart
                </Button>
              </LocalizedClientLink>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-y-4 py-16">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-sm text-background">
              <span>0</span>
            </div>
            <span>Your shopping bag is empty.</span>
            <LocalizedClientLink href="/store">
              <Button onClick={() => setOpen(false)}>Explore products</Button>
            </LocalizedClientLink>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default CartDropdown
