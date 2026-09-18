import type { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type ListAffiliatesStepInput = {
  filters: MedusaRequest["filterableFields"]
  queryConfig: MedusaRequest["queryConfig"]
}

export const listAffiliatesStep = createStep(
  "list-affiliates",
  async ({ filters, queryConfig }: ListAffiliatesStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: affiliates, metadata: { count, take, skip } = {} } =
      await query.graph({
        entity: "affiliate",
        filters,
        ...queryConfig,
      })

    return new StepResponse({
      affiliates,
      count: count ?? 0,
      limit: take ?? 0,
      offset: skip ?? 0,
    })
  },
)
