import { convertToLocale } from "@/store/lib/util/money"
import { HttpTypes } from "@medusajs/types"

import Divider from "@/store/modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <h2 className="my-6 flex flex-row text-2xl font-medium">Delivery</h2>
      <div className="flex items-start gap-x-8">
        <div
          className="flex w-1/3 flex-col"
          data-testid="shipping-address-summary"
        >
          <span className="mb-1 font-medium">Shipping Address</span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_address?.country_code?.toUpperCase()}
          </span>
        </div>

        <div
          className="flex w-1/3 flex-col"
          data-testid="shipping-contact-summary"
        >
          <span className="mb-1 font-medium">Contact</span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_address?.phone}
          </span>
          <span className="text-sm text-muted-foreground">{order.email}</span>
        </div>

        <div className="flex w-1/3 flex-col" data-testid="shipping-method-summary">
          <span className="mb-1 font-medium">Method</span>
          <span className="text-sm text-muted-foreground">
            {(order.shipping_methods?.[0] as { name?: string })?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </span>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
