"use client"
import { isStripeLike, paymentInfoMap } from "@/store/lib/constants"
import { initiatePaymentSession } from "@/store/lib/data/cart"
import ErrorMessage from "@/store/modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@/store/modules/checkout/components/payment-container"
import Divider from "@/store/modules/common/components/divider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RadioGroup } from "@/components/ui/radio-group"
import { RiBankCardLine, RiCheckboxCircleFill } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending",
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? "",
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) ||
    paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          },
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-background">
      <div className="mb-6 flex flex-row items-center justify-between">
        <h2
          className={cn(
            "flex flex-row items-baseline gap-x-2 text-2xl font-medium",
            !isOpen && !paymentReady && "pointer-events-none opacity-50 select-none",
          )}
        >
          Payment
          {!isOpen && paymentReady && (
            <RiCheckboxCircleFill className="text-success" />
          )}
        </h2>
        {!isOpen && paymentReady && (
          <button
            onClick={handleEdit}
            className="text-primary hover:text-primary/80"
            data-testid="edit-payment-button"
          >
            Edit
          </button>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={(value) => setPaymentMethod(value as string)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex w-1/3 flex-col">
              <span className="mb-1 font-medium text-foreground">
                Payment method
              </span>
              <span
                className="text-muted-foreground"
                data-testid="payment-method-summary"
              >
                Gift card
              </span>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="lg"
            className="mt-6"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {isLoading
              ? "Loading..."
              : !activeSession && isStripeLike(selectedPaymentMethod)
                ? " Enter card details"
                : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex w-full items-start gap-x-1">
              <div className="flex w-1/3 flex-col">
                <span className="mb-1 font-medium text-foreground">
                  Payment method
                </span>
                <span
                  className="text-muted-foreground"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </span>
              </div>
              <div className="flex w-1/3 flex-col">
                <span className="mb-1 font-medium text-foreground">
                  Payment details
                </span>
                <div
                  className="flex items-center gap-2 text-muted-foreground"
                  data-testid="payment-details-summary"
                >
                  <span className="flex h-7 w-fit items-center rounded-md bg-muted p-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <RiBankCardLine />
                    )}
                  </span>
                  <span>
                    {isStripeLike(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                  </span>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex w-1/3 flex-col">
              <span className="mb-1 font-medium text-foreground">
                Payment method
              </span>
              <span
                className="text-muted-foreground"
                data-testid="payment-method-summary"
              >
                Gift card
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
