"use server"

import { sdk } from "@/store/lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type VendorShippingOption = HttpTypes.StoreCartShippingOption & {
  vendor: { id: string; name: string } | null
}

// Same as the store's default shipping-options list, but each option also
// carries which vendor it belongs to (derived from shipping_profile_id) so
// the storefront can render one shipping choice per vendor instead of one
// for the whole cart.
export const listVendorShippingOptions = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  return sdk.client
    .fetch<{ shipping_options: VendorShippingOption[] }>(
      `/store/carts/${cartId}/vendor-shipping-options`,
      {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      },
    )
    .then(({ shipping_options }) => shipping_options)
    .catch(() => {
      return null
    })
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>,
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      },
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((_e) => {
      return null
    })
}
