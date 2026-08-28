import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export type AssertVendorHasNoOrdersStepInput = {
  id: string
}

export const assertVendorHasNoOrdersStep = createStep(
  "assert-vendor-has-no-orders",
  async (input: AssertVendorHasNoOrdersStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      filters: { id: input.id },
      fields: ["id", "orders.id"],
    })

    const orderCount = vendor?.orders?.length ?? 0
    if (orderCount > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Vendor ${input.id} has ${orderCount} order(s) — remove or reassign them before deleting this vendor.`,
      )
    }

    return new StepResponse(true)
  },
)
