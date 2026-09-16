import { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { convertToLocale } from "@/store/lib/util/money"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

export default function CartSummary({
  subtotal,
  currencyCode,
  className,
  ...props
}: ComponentProps<"div"> & {
  subtotal: number
  currencyCode: string
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Separator />
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          Subtotal <span className="font-normal">(excl. taxes)</span>
        </span>
        <span
          className="text-lg font-semibold"
          data-testid="cart-subtotal"
          data-value={subtotal}
        >
          {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
        </span>
      </div>
      <Button
        className="w-full"
        data-testid="go-to-cart-button"
        render={<LocalizedClientLink href="/cart" />}
      >
        Go to cart
      </Button>
    </div>
  )
}
