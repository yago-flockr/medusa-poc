import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { VENDOR_MODULE } from "../../../modules/vendor"

const orderLinkSchema = z.object({
  order: z.object({ id: z.string() }).nullable(),
})

export type ResolveOwnedConsignmentStepInput = {
  consignmentId: string
  vendorId: string
}

// status/vendor_id read via the module service, not query.graph, which can
// return a stale cached value for a linked entity right after a write.
export const resolveOwnedConsignmentStep = createStep(
  "resolve-owned-consignment",
  async (
    { consignmentId, vendorId }: ResolveOwnedConsignmentStepInput,
    { container },
  ) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const consignment = await vendorModuleService
      .retrieveConsignment(consignmentId)
      .catch(() => null)

    if (!consignment || consignment.vendor_id !== vendorId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Consignment with id: ${consignmentId} was not found`,
      )
    }

    const {
      data: [rawLink],
    } = await query.graph({
      entity: "consignment",
      fields: ["order.id"],
      filters: { id: consignmentId },
    })

    const link = orderLinkSchema.safeParse(rawLink)

    if (!link.success || !link.data.order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Consignment with id: ${consignmentId} was not found`,
      )
    }

    return new StepResponse({
      orderId: link.data.order.id,
      status: consignment.status,
    })
  },
)
