import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { graph } from "../../../lib/query"
import { PRODUCT_DETAIL_FIELDS } from "../mappers/build-vendor-product-detail"

export type GetVendorProductDetailStepInput = {
  productId: string
}

// Ownership is assumed already asserted earlier in the same workflow run —
// this is only the post-mutation re-fetch for the response.
export const getVendorProductDetailStep = createStep(
  "get-vendor-product-detail",
  async ({ productId }: GetVendorProductDetailStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [product],
    } = await graph(query, {
      entity: "product",
      fields: PRODUCT_DETAIL_FIELDS,
      filters: { id: productId },
    })

    return new StepResponse(product)
  },
)
