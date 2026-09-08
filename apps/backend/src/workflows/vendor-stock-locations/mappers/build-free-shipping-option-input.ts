import { STORE_SUPPORTED_CURRENCIES } from "../../../lib/markets"

export type BuildFreeShippingOptionInputParams = {
  serviceZoneId: string
  shippingProfileId: string
}

export function buildFreeShippingOptionInput({
  serviceZoneId,
  shippingProfileId,
}: BuildFreeShippingOptionInputParams) {
  return [
    {
      name: "Free Shipping",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfileId,
      type: {
        label: "Free Shipping",
        description: "The vendor arranges and pays for delivery themselves.",
        code: "free",
      },
      prices: STORE_SUPPORTED_CURRENCIES.map((currency) => ({
        currency_code: currency.currency_code,
        amount: 0,
      })),
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq" as const,
        },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    },
  ]
}
