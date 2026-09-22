import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export const listProductCategoriesStep = createStep(
  "list-product-categories",
  async (_input: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: productCategories } = await graph(query, {
      entity: "product_category",
      fields: ["id", "name", "handle"],
      filters: { is_active: true, is_internal: false },
    })

    return new StepResponse(productCategories)
  },
)
