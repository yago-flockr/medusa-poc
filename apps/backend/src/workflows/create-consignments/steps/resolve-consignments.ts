import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import consignmentOrderLink from "../../../links/consignment-order"
import { buildConsignmentList } from "../mappers/build-consignment-list"

export type ResolveConsignmentsStepInput = {
  orderId: string
}

// Runs unconditionally so a retry after a timeout still returns the real
// consignments, whether just created or already existing.
export const resolveConsignmentsStep = createStep(
  "resolve-consignments",
  async ({ orderId }: ResolveConsignmentsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: links } = await query.graph({
      entity: consignmentOrderLink.entryPoint,
      fields: ["consignment.id", "consignment.status", "consignment.vendor.id"],
      filters: { order_id: orderId },
    })

    return new StepResponse(buildConsignmentList(links))
  },
)
