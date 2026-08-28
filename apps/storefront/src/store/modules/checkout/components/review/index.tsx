"use client"

import { cn } from "@/lib/utils"

import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import PaymentButton from "../payment-button"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-background">
      <div className="mb-6 flex flex-row items-center justify-between">
        <h2
          className={cn(
            "flex flex-row items-baseline gap-x-2 text-2xl font-medium",
            !isOpen && "pointer-events-none opacity-50 select-none",
          )}
        >
          Review
        </h2>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 flex w-full items-start gap-x-1">
            <div className="w-full">
              <span className="mb-1 block font-medium text-foreground">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </span>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
