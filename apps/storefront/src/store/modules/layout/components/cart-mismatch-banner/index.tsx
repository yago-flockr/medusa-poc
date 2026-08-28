"use client"

import { transferCart } from "@/store/lib/data/customer"
import { Button } from "@/components/ui/button"
import { RiErrorWarningLine } from "@remixicon/react"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { useState } from "react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Run transfer again")

  if (!customer || !!cart.customer_id) {
    return
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Transferring..")

      await transferCart()
    } catch {
      setActionText("Run transfer again")
      setIsPending(false)
    }
  }

  return (
    <div className="mt-2 flex items-center justify-center gap-1 bg-warning/15 p-2 text-center text-sm text-foreground sm:gap-2 sm:p-4">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
        <span className="flex items-center gap-1">
          <RiErrorWarningLine className="inline" size={16} />
          Something went wrong when we tried to transfer your cart
        </span>

        <span>·</span>

        <Button
          variant="link"
          className="h-auto p-0"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
