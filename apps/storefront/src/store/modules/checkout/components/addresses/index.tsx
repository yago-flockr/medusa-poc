"use client"
import { setAddresses } from "@/store/lib/data/cart"
import useToggleState from "@/store/lib/hooks/use-toggle-state"
import compareAddresses from "@/store/lib/util/compare-addresses"
import Divider from "@/store/modules/common/components/divider"
import { Spinner } from "@/components/ui/spinner"
import { RiCheckboxCircleFill } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true,
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-background">
      <div className="mb-6 flex flex-row items-center justify-between">
        <h2 className="flex flex-row items-baseline gap-x-2 text-2xl font-medium">
          Shipping Address
          {!isOpen && <RiCheckboxCircleFill className="text-success" />}
        </h2>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="text-primary hover:text-primary/80"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <h2 className="gap-x-4 pt-8 pb-6 text-2xl font-medium">
                  Billing address
                </h2>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-sm">
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex w-full items-start gap-x-1">
                  <div
                    className="flex w-1/3 flex-col"
                    data-testid="shipping-address-summary"
                  >
                    <span className="mb-1 font-medium text-foreground">
                      Shipping Address
                    </span>
                    <span className="text-muted-foreground">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </span>
                    <span className="text-muted-foreground">
                      {cart.shipping_address.address_1}{" "}
                      {cart.shipping_address.address_2}
                    </span>
                    <span className="text-muted-foreground">
                      {cart.shipping_address.postal_code},{" "}
                      {cart.shipping_address.city}
                    </span>
                    <span className="text-muted-foreground">
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </span>
                  </div>

                  <div
                    className="flex w-1/3 flex-col"
                    data-testid="shipping-contact-summary"
                  >
                    <span className="mb-1 font-medium text-foreground">
                      Contact
                    </span>
                    <span className="text-muted-foreground">
                      {cart.shipping_address.phone}
                    </span>
                    <span className="text-muted-foreground">{cart.email}</span>
                  </div>

                  <div
                    className="flex w-1/3 flex-col"
                    data-testid="billing-address-summary"
                  >
                    <span className="mb-1 font-medium text-foreground">
                      Billing Address
                    </span>

                    {sameAsBilling ? (
                      <span className="text-muted-foreground">
                        Billing and delivery address are the same.
                      </span>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </span>
                        <span className="text-muted-foreground">
                          {cart.billing_address?.address_1}{" "}
                          {cart.billing_address?.address_2}
                        </span>
                        <span className="text-muted-foreground">
                          {cart.billing_address?.postal_code},{" "}
                          {cart.billing_address?.city}
                        </span>
                        <span className="text-muted-foreground">
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
