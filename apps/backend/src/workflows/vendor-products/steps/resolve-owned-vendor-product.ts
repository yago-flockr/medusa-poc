import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ResolveOwnedVendorProductStepInput = {
  productId: string
  vendorId: string
}

export const resolveOwnedVendorProductStep = createStep(
  "resolve-owned-vendor-product",
  async (
    { productId, vendorId }: ResolveOwnedVendorProductStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [product],
    } = await graph(query, {
      entity: "product",
      fields: ["id", "external_id"],
      filters: { id: productId, vendor: { id: vendorId } },
    })

    if (!product) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product with id: ${productId} was not found`,
      )
    }

    return new StepResponse({ id: product.id, externalId: product.external_id })
  },
)
