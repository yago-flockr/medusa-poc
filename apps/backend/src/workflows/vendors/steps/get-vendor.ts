import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

import { graph } from "../../../lib/query"
export type GetVendorStepInput = {
  id: string
  queryConfig: MedusaRequest["queryConfig"]
}

export const getVendorStep = createStep(
  "get-vendor",
  async ({ id, queryConfig }: GetVendorStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [vendor],
    } = await graph(query, {
      entity: "vendor",
      filters: { id },
      ...queryConfig,
    })

    if (!vendor) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Vendor with id: ${id} was not found`,
      )
    }

    return new StepResponse(vendor)
  },
)
