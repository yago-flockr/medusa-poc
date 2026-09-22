import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

import { graph } from "../../../lib/query"
export type GetBrandStepInput = {
  id: string
  queryConfig: MedusaRequest["queryConfig"]
}

export const getBrandStep = createStep(
  "get-brand",
  async ({ id, queryConfig }: GetBrandStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [brand],
    } = await graph(query, {
      entity: "brand",
      filters: { id },
      ...queryConfig,
    })

    if (!brand) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Brand with id: ${id} was not found`,
      )
    }

    return new StepResponse(brand)
  },
)
