import CartTotals from "@/store/modules/common/components/cart-totals"
import Items from "@/store/modules/order/components/items"
import OrderDetails from "@/store/modules/order/components/order-details"
import PaymentDetails from "@/store/modules/order/components/payment-details"
import ShippingDetails from "@/store/modules/order/components/shipping-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] py-6">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-y-10 px-4">
        <div
          className="flex h-full w-full max-w-4xl flex-col gap-4 py-10"
          data-testid="order-complete-container"
        >
          <h1 className="mb-4 flex flex-col gap-y-3 text-3xl font-semibold">
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </h1>
          <OrderDetails order={order} />
          <h2 className="flex flex-row text-2xl font-medium">Summary</h2>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
        </div>
      </div>
    </div>
  )
}
