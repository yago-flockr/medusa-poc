import { createStep } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type AssertCategoriesExistStepInput = {
  categoryIds: string[]
}

export const assertCategoriesExistStep = createStep(
  "assert-categories-exist",
  async ({ categoryIds }: AssertCategoriesExistStepInput, { container }) => {
    if (!categoryIds.length) return

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id"],
      filters: { id: categoryIds },
    })

    const foundIds = new Set(categories.map((category) => category.id))
    const missingIds = categoryIds.filter((id) => !foundIds.has(id))

    if (missingIds.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Categor${missingIds.length > 1 ? "ies" : "y"} not found: ${missingIds.join(", ")}`,
      )
    }
  },
)
