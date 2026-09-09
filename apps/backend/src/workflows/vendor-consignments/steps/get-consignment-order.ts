import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { getOrderDetailWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "@medusajs/framework/zod"

const orderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  variant_title: z.string().nullable(),
  variant_sku: z.string().nullable(),
  quantity: z.coerce.number(),
  unit_price: z.coerce.number(),
  total: z.coerce.number(),
  consignment: z.object({ id: z.string() }).nullable(),
  detail: z
    .object({
      fulfilled_quantity: z.coerce.number(),
      shipped_quantity: z.coerce.number(),
      delivered_quantity: z.coerce.number(),
    })
    .nullable(),
})

const orderAddressSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  address_1: z.string().nullable(),
  address_2: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  postal_code: z.string().nullable(),
  country_code: z.string().nullable(),
  phone: z.string().nullable(),
})

const orderDetailSchema = z.object({
  id: z.string(),
  display_id: z.coerce.number(),
  status: z.string(),
  currency_code: z.string(),
  items: z.array(orderItemSchema).nullable(),
  shipping_address: orderAddressSchema.nullable(),
})

export type OrderDetail = z.infer<typeof orderDetailSchema>

export type GetConsignmentOrderStepInput = {
  orderId: string
}

export const getConsignmentOrderStep = createStep(
  "get-consignment-order",
  async ({ orderId }: GetConsignmentOrderStepInput, { container }) => {
    const { result: order } = await getOrderDetailWorkflow(container).run({
      input: {
        order_id: orderId,
        fields: [
          "id",
          "display_id",
          "status",
          "currency_code",
          "total",
          "summary.*",
          "items.*",
          "items.tax_lines.*",
          "items.adjustments.*",
          "items.consignment.id",
          "items.detail.fulfilled_quantity",
          "items.detail.shipped_quantity",
          "items.detail.delivered_quantity",
          "shipping_address.first_name",
          "shipping_address.last_name",
          "shipping_address.address_1",
          "shipping_address.address_2",
          "shipping_address.city",
          "shipping_address.province",
          "shipping_address.postal_code",
          "shipping_address.country_code",
          "shipping_address.phone",
        ],
      },
    })

    return new StepResponse(orderDetailSchema.parse(order))
  },
)
