import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listShippingOptionsForCartWorkflow } from "@medusajs/medusa/core-flows"

const SHIPPING_OPTION_FIELDS = [
  "id",
  "name",
  "price_type",
  "amount",
  "calculated_price.*",
  "service_zone_id",
  "shipping_profile_id",
  "fulfillment_provider_id",
  "shipping_option_type_id",
  "metadata",
]

// Same data the store's default GET /store/shipping-options returns, plus
// which vendor each option belongs to — derived from shipping_profile_id via
// the vendor-shipping-profile link (see src/links/vendor-shipping-profile.ts),
// not a separate shipping concept. Options with no owning vendor (e.g. a
// store-level pickup option) come back with vendor: null so the storefront
// can still render them ungrouped.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: cartId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { result: shippingOptions } = await listShippingOptionsForCartWorkflow(
    req.scope,
  ).run({
    input: {
      cart_id: cartId,
      is_return: false,
      fields: SHIPPING_OPTION_FIELDS,
    },
  })

  const profileIds = [
    ...new Set(
      shippingOptions
        .map((option) => option.shipping_profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "vendor.id", "vendor.name"],
    filters: { id: profileIds },
  })

  const vendorByProfileId = new Map(
    shippingProfiles
      .filter((profile) => profile.vendor?.id)
      .map((profile) => [profile.id, profile.vendor!]),
  )

  const options = shippingOptions.map((option) => ({
    ...option,
    vendor: option.shipping_profile_id
      ? (vendorByProfileId.get(option.shipping_profile_id) ?? null)
      : null,
  }))

  res.json({ shipping_options: options })
}
