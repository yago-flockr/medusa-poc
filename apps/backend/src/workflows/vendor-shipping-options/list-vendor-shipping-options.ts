import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { listShippingOptionsForCartWorkflow } from "@medusajs/medusa/core-flows"
import { resolveShippingProfileVendorsStep } from "./steps/resolve-shipping-profile-vendors"
import { resolveCartVendorIdsStep } from "./steps/resolve-cart-vendor-ids"
import { buildVendorShippingOptions } from "./mappers/build-vendor-shipping-options"

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

export type ListVendorShippingOptionsWorkflowInput = {
  cartId: string
}

export const listVendorShippingOptionsWorkflow = createWorkflow(
  "list-vendor-shipping-options",
  function (input: ListVendorShippingOptionsWorkflowInput) {
    const shippingOptions = listShippingOptionsForCartWorkflow.runAsStep({
      input: {
        cart_id: input.cartId,
        is_return: false,
        fields: SHIPPING_OPTION_FIELDS,
      },
    })

    const profileIds = transform({ shippingOptions }, (data) => [
      ...new Set(
        data.shippingOptions
          .map((option) => option.shipping_profile_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ])
    const vendorByProfileId = resolveShippingProfileVendorsStep({ profileIds })
    const cartVendorIds = resolveCartVendorIdsStep({ cartId: input.cartId })

    const response = transform(
      { shippingOptions, vendorByProfileId, cartVendorIds },
      (data) => ({
        shipping_options: buildVendorShippingOptions(
          data.shippingOptions,
          data.vendorByProfileId,
          data.cartVendorIds,
        ),
      }),
    )

    return new WorkflowResponse(response)
  },
)
