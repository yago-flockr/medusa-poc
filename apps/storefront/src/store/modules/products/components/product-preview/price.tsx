import { cn } from "@/lib/utils"
import { VariantPrice } from "@/types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="text-muted-foreground line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={cn("text-muted-foreground", {
          "text-primary": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
