import ItemsPreviewTemplate from "@/store/modules/cart/templates/preview"
import DiscountCode from "@/store/modules/checkout/components/discount-code"
import CartTotals from "@/store/modules/common/components/cart-totals"
import Divider from "@/store/modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse gap-y-8 py-8 sm:flex-col sm:py-0">
      <div className="flex w-full flex-col bg-background">
        <Divider className="my-6 sm:hidden" />
        <h2 className="flex flex-row items-baseline text-2xl font-medium">
          In your Cart
        </h2>
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
