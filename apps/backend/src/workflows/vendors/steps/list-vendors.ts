import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

import { graph } from "../../../lib/query"
export type ListVendorsStepInput = {
  filters: MedusaRequest["filterableFields"]
  queryConfig: MedusaRequest["queryConfig"]
}

export const listVendorsStep = createStep(
  "list-vendors",
  async ({ filters, queryConfig }: ListVendorsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: vendors, metadata: { count, take, skip } = {} } = await graph(
      query,
      {
        entity: "vendor",
        filters,
        ...queryConfig,
      },
    )

    return new StepResponse({
      vendors,
      count: count ?? 0,
      limit: take ?? 0,
      offset: skip ?? 0,
    })
  },
)
