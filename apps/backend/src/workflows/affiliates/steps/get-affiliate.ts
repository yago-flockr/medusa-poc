import type { MedusaRequest } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { graph } from "../../../lib/query"
export type GetAffiliateStepInput = {
  id: string
  queryConfig: MedusaRequest["queryConfig"]
}

export const getAffiliateStep = createStep(
  "get-affiliate",
  async ({ id, queryConfig }: GetAffiliateStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [affiliate],
    } = await graph(query, {
      entity: "affiliate",
      filters: { id },
      ...queryConfig,
    })

    if (!affiliate) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Affiliate with id: ${id} was not found`,
      )
    }

    return new StepResponse(affiliate)
  },
)
