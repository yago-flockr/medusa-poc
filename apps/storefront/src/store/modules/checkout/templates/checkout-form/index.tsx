import { listCartShippingMethods } from "@/store/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/store/lib/data/payment"
import Addresses from "@/store/modules/checkout/components/addresses"
import Payment from "@/store/modules/checkout/components/payment"
import Review from "@/store/modules/checkout/components/review"
import Shipping from "@/store/modules/checkout/components/shipping"
import { HttpTypes } from "@medusajs/types"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
