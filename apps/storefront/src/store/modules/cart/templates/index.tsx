import { HttpTypes } from "@medusajs/types"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import ItemsTemplate from "./items"
import Summary from "./summary"
import { Separator } from "@/components/ui/separator"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="container" data-testid="cart-container">
      {cart?.items?.length ? (
        <div className="grid grid-cols-1 gap-x-40 sm:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-y-6 bg-background py-6">
            {!customer && (
              <>
                <SignInPrompt />
                <Separator />
              </>
            )}
            <ItemsTemplate cart={cart} />
          </div>
          <div className="relative">
            <div className="sticky top-12 flex flex-col gap-y-8">
              {cart && cart.region && (
                <>
                  <div className="bg-background py-6">
                    <Summary cart={cart} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <EmptyCartMessage />
        </div>
      )}
    </div>
  )
}

export default CartTemplate
