import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { vendorConsignmentStatusSchema } from "@dtc/api-contracts/vendor/orders"

const ownedConsignmentSchema = z.object({
  id: z.string(),
  status: vendorConsignmentStatusSchema,
  order: z.object({ id: z.string() }).nullable(),
})

export type ResolveOwnedConsignmentStepInput = {
  consignmentId: string
  vendorId: string
}

export const resolveOwnedConsignmentStep = createStep(
  "resolve-owned-consignment",
  async (
    { consignmentId, vendorId }: ResolveOwnedConsignmentStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawConsignment],
    } = await query.graph({
      entity: "consignment",
      fields: ["id", "status", "order.id"],
      filters: { id: consignmentId, vendor_id: vendorId },
    })

    const consignment = rawConsignment
      ? ownedConsignmentSchema.safeParse(rawConsignment)
      : undefined

    if (!consignment?.success || !consignment.data.order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Consignment with id: ${consignmentId} was not found`,
      )
    }

    return new StepResponse({
      orderId: consignment.data.order.id,
      status: consignment.data.status,
    })
  },
)
