import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import consignmentOrderLink from "../../../links/consignment-order"

export type ResolveConsignmentsStepInput = {
  orderId: string
}

// Runs unconditionally, whether this call just created the consignments or
// they already existed from an earlier, successful attempt — so a retry
// after a client timeout still gets the real consignments back instead of
// losing them from the response.
export const resolveConsignmentsStep = createStep(
  "resolve-consignments",
  async ({ orderId }: ResolveConsignmentsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: links } = await query.graph({
      entity: consignmentOrderLink.entryPoint,
      fields: ["consignment.id", "consignment.status", "consignment.vendor.id"],
      filters: { order_id: orderId },
    })

    const consignments = links
      .map((link) => link.consignment)
      .filter((consignment): consignment is NonNullable<typeof consignment> => consignment != null)
      .map((consignment) => ({
        id: consignment.id,
        status: consignment.status,
        vendor_id: consignment.vendor?.id,
      }))

    return new StepResponse(consignments)
  },
)
