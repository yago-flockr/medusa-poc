"use client"

import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import Help from "@/store/modules/order/components/help"
import Items from "@/store/modules/order/components/items"
import OrderDetails from "@/store/modules/order/components/order-details"
import OrderSummary from "@/store/modules/order/components/order-summary"
import ShippingDetails from "@/store/modules/order/components/shipping-details"
import { RiCloseLine } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          data-testid="back-to-overview-button"
        >
          <RiCloseLine size={16} /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex h-full w-full flex-col gap-4"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
