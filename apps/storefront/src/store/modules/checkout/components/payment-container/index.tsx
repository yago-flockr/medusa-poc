import { cn } from "@/lib/utils"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import React, { useContext, useMemo, type JSX } from "react"

import { isManual } from "@/store/lib/constants"
import SkeletonCardDetails from "@/store/modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"
  const isSelected = selectedPaymentOptionId === paymentProviderId

  return (
    <RadioPrimitive.Root
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={cn(
        "mb-2 flex cursor-pointer flex-col gap-y-2 rounded-md border px-8 py-4 text-sm hover:shadow-sm",
        isSelected && "border-primary",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <span className="flex size-4 items-center justify-center rounded-full border border-input">
            <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
          </span>
          <span>{paymentInfoMap[paymentProviderId]?.title || paymentProviderId}</span>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden sm:block" />
          )}
        </div>
        <span className="justify-self-end text-foreground">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="text-[10px] sm:hidden" />
      )}
      {children}
    </RadioPrimitive.Root>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "mt-0 block h-11 w-full appearance-none rounded-md border border-input bg-input/50 px-4 pt-3 pb-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-0",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <span className="mb-1 block font-medium text-foreground">
              Enter your card details:
            </span>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1),
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
