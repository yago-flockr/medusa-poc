"use client"
import { createTransferRequest } from "@/store/lib/data/orders"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RiCheckboxCircleFill, RiCloseCircleLine } from "@remixicon/react"
import { useActionState } from "react"
import { SubmitButton } from "@/store/modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="grid w-full items-center gap-x-8 gap-y-4 sm:grid-cols-2">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-sm font-semibold">Order transfers</h3>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex w-full flex-col gap-y-2">
            <Input className="w-full" name="order_id" placeholder="Order ID" />
            <SubmitButton
              variant="secondary"
              size="sm"
              className="w-fit self-end whitespace-nowrap"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <p className="text-right text-sm text-destructive">{state.error}</p>
      )}
      {showSuccess && (
        <div className="flex w-full items-center justify-between self-stretch rounded-md border bg-muted p-4">
          <div className="flex items-center gap-x-2">
            <RiCheckboxCircleFill className="text-success" size={16} />
            <div className="flex flex-col gap-y-1">
              <span className="text-sm font-medium">
                Transfer for order {state.order?.id} requested
              </span>
              <span className="text-sm text-muted-foreground">
                Transfer request email sent to {state.order?.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <RiCloseCircleLine className="text-muted-foreground" size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
