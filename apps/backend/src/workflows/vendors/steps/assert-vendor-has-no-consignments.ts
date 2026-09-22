import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type AssertVendorHasNoConsignmentsStepInput = {
  id: string
}

export const assertVendorHasNoConsignmentsStep = createStep(
  "assert-vendor-has-no-consignments",
  async (input: AssertVendorHasNoConsignmentsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [vendor],
    } = await graph(query, {
      entity: "vendor",
      filters: { id: input.id },
      fields: ["id", "consignments.id"],
    })

    const consignmentCount = vendor?.consignments?.length ?? 0
    if (consignmentCount > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Vendor ${input.id} has ${consignmentCount} consignment(s) — remove or reassign them before deleting this vendor.`,
      )
    }

    return new StepResponse(true)
  },
)
