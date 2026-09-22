import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export const listRegionsStep = createStep(
  "list-regions",
  async (_input: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: regions } = await graph(query, {
      entity: "region",
      fields: ["id", "countries.iso_2", "countries.display_name"],
    })

    return new StepResponse(regions)
  },
)
