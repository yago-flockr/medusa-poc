import { convertToLocale } from "@/store/lib/util/money"
import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const total = item.total ?? 0
  const original_total = item.original_total ?? 0
  const hasReducedPrice = total < original_total

  const percentage_diff = Math.round(
    ((original_total - total) / original_total) * 100,
  )

  return (
    <div className="flex h-full flex-col justify-center text-muted-foreground">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && <span>Original: </span>}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: original_total / item.quantity,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-primary">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={cn("text-sm", { "text-primary": hasReducedPrice })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: total / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
