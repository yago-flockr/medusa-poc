import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { vendorConsignmentStatusSchema } from "@dtc/api-contracts/vendor/orders"

import { graph } from "../../../lib/query"
const consignmentListItemSchema = z.object({
  id: z.string().nullable(),
  title: z.string().nullable(),
  quantity: z.coerce.number().nullable(),
  total: z.coerce.number().nullable(),
  consignment: z.object({ id: z.string().nullable() }).nullable().optional(),
})

const consignmentListRowSchema = z.object({
  id: z.string(),
  status: vendorConsignmentStatusSchema,
  order: z
    .object({
      id: z.string(),
      display_id: z.coerce.number(),
      currency_code: z.string(),
      items: z
        .array(consignmentListItemSchema.nullable())
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})

export type ConsignmentListRow = z.infer<typeof consignmentListRowSchema>

export type ListConsignmentsStepInput = {
  vendorId: string
  limit: number
  offset: number
}

export const listConsignmentsStep = createStep(
  "list-consignments",
  async (
    { vendorId, limit, offset }: ListConsignmentsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: consignments, metadata } = await graph(query, {
      entity: "consignment",
      fields: [
        "id",
        "status",
        "order.id",
        "order.display_id",
        "order.currency_code",
        "order.total",
        "order.summary.*",
        "order.items.*",
        "order.items.tax_lines.*",
        "order.items.adjustments.*",
        "order.items.consignment.id",
      ],
      filters: { vendor_id: vendorId },
      pagination: { skip: offset, take: limit },
    })

    return new StepResponse({
      consignments: z.array(consignmentListRowSchema).parse(consignments),
      count: metadata?.count ?? 0,
    })
  },
)
