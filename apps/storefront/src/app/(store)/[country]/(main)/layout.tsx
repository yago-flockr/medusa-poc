import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@/store/lib/data/cart"
import { retrieveCustomer } from "@/store/lib/data/customer"
import { getBaseURL } from "@/store/lib/util/env"
import CartMismatchBanner from "@/store/modules/layout/components/cart-mismatch-banner"
import Footer from "@/store/modules/layout/templates/footer"
import Nav from "@/store/modules/layout/templates/nav"
import FreeShippingPriceNudge from "@/store/modules/shipping/components/free-shipping-price-nudge"
import { StoreCartShippingOption } from "@medusajs/types"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
    </>
  )
}
