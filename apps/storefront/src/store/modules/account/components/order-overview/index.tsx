"use client"

import { Button } from "@/components/ui/button"

import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import OrderCard from "../order-card"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div key={o.id} className="border-b pb-6 last:border-none last:pb-0">
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-y-4"
      data-testid="no-orders-container"
    >
      <h2 className="text-lg font-semibold">Nothing to see here</h2>
      <p className="text-sm">
        You don&apos;t have any orders yet, let us change that {":)"}
      </p>
      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
