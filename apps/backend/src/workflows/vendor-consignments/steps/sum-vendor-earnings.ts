import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { graph } from "../../../lib/query"

const earningsRowSchema = z.object({
  subtotal: z.coerce.number(),
  commission_total: z.coerce.number(),
  earning_total: z.coerce.number(),
})

export type SumVendorEarningsStepInput = {
  vendorId: string
}

export const sumVendorEarningsStep = createStep(
  "sum-vendor-earnings",
  async ({ vendorId }: SumVendorEarningsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: consignments } = await graph(query, {
      entity: "consignment",
      fields: ["subtotal", "commission_total", "earning_total"],
      filters: { vendor_id: vendorId },
    })

    const totals = z
      .array(earningsRowSchema)
      .parse(consignments)
      .reduce(
        (sum, row) => ({
          subtotal: sum.subtotal + row.subtotal,
          commission_total: sum.commission_total + row.commission_total,
          earning_total: sum.earning_total + row.earning_total,
        }),
        { subtotal: 0, commission_total: 0, earning_total: 0 },
      )

    return new StepResponse(totals)
  },
)
