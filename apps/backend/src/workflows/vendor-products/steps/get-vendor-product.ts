import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { PRODUCT_DETAIL_FIELDS } from "../mappers/build-vendor-product-detail"

export type GetVendorProductStepInput = {
  productId: string
  vendorId: string
}

export const getVendorProductStep = createStep(
  "get-vendor-product",
  async ({ productId, vendorId }: GetVendorProductStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [product],
    } = await query.graph({
      entity: "product",
      fields: PRODUCT_DETAIL_FIELDS,
      filters: { id: productId, vendor: { id: vendorId } },
    })

    if (!product) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id: ${productId} was not found`,
      )
    }

    return new StepResponse(product)
  },
)
