import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

export type ListBrandsStepInput = {
  filters: MedusaRequest["filterableFields"]
  queryConfig: MedusaRequest["queryConfig"]
}

export const listBrandsStep = createStep(
  "list-brands",
  async ({ filters, queryConfig }: ListBrandsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: brands, metadata: { count, take, skip } = {} } =
      await query.graph({
        entity: "brand",
        filters,
        ...queryConfig,
      })

    return new StepResponse({
      brands,
      count: count ?? 0,
      limit: take ?? 0,
      offset: skip ?? 0,
    })
  },
)
