import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

const orderShippingMethodsSchema = z.object({
  shipping_methods: z
    .array(z.object({ shipping_option_id: z.string().nullable() }))
    .nullable(),
})

const vendorLocationSchema = z.object({
  id: z.string(),
  fulfillment_sets: z
    .array(
      z.object({
        service_zones: z.array(
          z.object({
            shipping_options: z.array(z.object({ id: z.string() })).nullable(),
          }),
        ),
      }),
    )
    .nullable(),
})

export type ResolveVendorShippingOptionStepInput = {
  orderId: string
  vendorId: string
}

export const resolveVendorShippingOptionStep = createStep(
  "resolve-vendor-shipping-option",
  async (
    { orderId, vendorId }: ResolveVendorShippingOptionStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawOrder],
    } = await query.graph({
      entity: "order",
      fields: ["shipping_methods.shipping_option_id"],
      filters: { id: orderId },
    })
    const order = orderShippingMethodsSchema.parse(rawOrder)

    const {
      data: [rawLocation],
    } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_sets.service_zones.shipping_options.id"],
      filters: { vendor: { id: vendorId } },
    })

    if (!rawLocation) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "This vendor has no stock location to dispatch from.",
      )
    }

    const location = vendorLocationSchema.parse(rawLocation)

    const vendorShippingOptionIds = new Set(
      (location.fulfillment_sets ?? [])
        .flatMap((set) => set.service_zones)
        .flatMap((zone) => zone.shipping_options ?? [])
        .map((option) => option.id),
    )

    const shippingOptionId = (order.shipping_methods ?? [])
      .map((method) => method.shipping_option_id)
      .find(
        (optionId): optionId is string =>
          !!optionId && vendorShippingOptionIds.has(optionId),
      )

    if (!shippingOptionId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "This order has no shipping method matching this vendor's stock location.",
      )
    }

    return new StepResponse({ locationId: location.id, shippingOptionId })
  },
)
