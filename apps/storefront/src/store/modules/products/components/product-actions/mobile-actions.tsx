import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import React, { useMemo, useState } from "react"

import { RiArrowDownSLine } from "@remixicon/react"

import { getProductPrice } from "@/store/lib/util/get-product-price"
import { isSimpleProduct } from "@/store/lib/util/product"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "./option-select"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  productOptions: HttpTypes.StoreProductOption[]
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  productOptions,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const [open, setOpen] = useState(false)

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 transition-opacity duration-300 lg:hidden",
          show
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-y-3 border-t bg-background p-4"
          data-testid="mobile-actions"
        >
          <div className="flex items-center gap-x-2">
            <span data-testid="mobile-title">{product.title}</span>
            <span>—</span>
            {selectedPrice ? (
              <div className="flex items-end gap-x-2 text-foreground">
                {selectedPrice.price_type === "sale" && (
                  <p>
                    <span className="text-sm line-through">
                      {selectedPrice.original_price}
                    </span>
                  </p>
                )}
                <span
                  className={cn({
                    "text-primary": selectedPrice.price_type === "sale",
                  })}
                >
                  {selectedPrice.calculated_price}
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div
            className={cn("grid w-full grid-cols-2 gap-x-4", {
              "grid-cols-1": isSimple,
            })}
          >
            {!isSimple && (
              <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="w-full"
                data-testid="mobile-actions-button"
              >
                <div className="flex w-full items-center justify-between">
                  <span>
                    {variant
                      ? Object.values(options).join(" / ")
                      : "Select Options"}
                  </span>
                  <RiArrowDownSLine size={16} />
                </div>
              </Button>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || !variant}
              className="w-full"
              data-testid="mobile-cart-button"
            >
              {isAdding && <Spinner />}
              {!variant
                ? "Select variant"
                : !inStock
                  ? "Out of stock"
                  : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md"
          data-testid="mobile-actions-modal"
        >
          <DialogHeader>
            <DialogTitle>Select options</DialogTitle>
          </DialogHeader>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-6">
              {productOptions.map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={updateOptions}
                      title={option.title ?? ""}
                      disabled={optionsDisabled}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MobileActions
