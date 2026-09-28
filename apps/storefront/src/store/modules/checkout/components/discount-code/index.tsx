"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React from "react"

import { applyPromotions } from "@/store/lib/data/cart"
import { convertToLocale } from "@/store/lib/util/money"
import { RiDeleteBinLine } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code,
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!),
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }

    if (input) {
      input.value = ""
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 text-sm">
      <form
        action={(a) => addPromotionCode(a)}
        className="flex w-full flex-col gap-2"
      >
        <Button
          type="button"
          variant="link"
          className="w-fit"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="add-discount-button"
        >
          Add Promotion Code(s)
        </Button>

        {isOpen && (
          <>
            <div className="flex w-full gap-2">
              <Input
                id="promotion-input"
                name="code"
                type="text"
                aria-label="Promotion code"
                data-testid="discount-input"
              />
              <SubmitButton
                variant="secondary"
                data-testid="discount-apply-button"
              >
                Apply
              </SubmitButton>
            </div>

            <ErrorMessage
              error={errorMessage}
              data-testid="discount-error-message"
            />
          </>
        )}
      </form>

      {promotions.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <span className="font-medium">Promotion(s) applied:</span>

          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="flex w-full items-center justify-between gap-2"
              data-testid="discount-row"
            >
              <span className="truncate" data-testid="discount-code">
                <Badge variant={promotion.is_automatic ? "success" : "muted"}>
                  {promotion.code}
                </Badge>{" "}
                (
                {promotion.application_method?.value !== undefined &&
                  promotion.application_method.currency_code !== undefined &&
                  (promotion.application_method.type === "percentage"
                    ? `${promotion.application_method.value}%`
                    : convertToLocale({
                        amount: +promotion.application_method.value,
                        currency_code:
                          promotion.application_method.currency_code,
                      }))}
                )
              </span>
              {!promotion.is_automatic && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove discount code from order"
                  onClick={() => {
                    if (promotion.code) {
                      removePromotionCode(promotion.code)
                    }
                  }}
                  data-testid="remove-discount-button"
                >
                  <RiDeleteBinLine />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiscountCode
