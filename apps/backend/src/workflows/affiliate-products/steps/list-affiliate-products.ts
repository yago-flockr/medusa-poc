import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type ListAffiliateProductsStepInput = {
  affiliateId: string
}

export const listAffiliateProductsStep = createStep(
  "list-affiliate-products",
  async ({ affiliateId }: ListAffiliateProductsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [affiliate],
    } = await query.graph({
      entity: "affiliate",
      fields: [
        "id",
        "products.id",
        "products.title",
        "products.handle",
        "products.thumbnail",
      ],
      filters: { id: affiliateId },
    })

    return new StepResponse(affiliate?.products ?? [])
  },
)
