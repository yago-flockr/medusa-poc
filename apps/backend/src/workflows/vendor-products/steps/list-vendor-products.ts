import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type ListVendorProductsStepInput = {
  vendorId: string
  limit: number
  offset: number
}

export const listVendorProductsStep = createStep(
  "list-vendor-products",
  async (
    { vendorId, limit, offset }: ListVendorProductsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: products, metadata } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "status",
        "thumbnail",
        "external_id",
        "variants.id",
      ],
      filters: { vendor: { id: vendorId } },
      pagination: { skip: offset, take: limit },
    })

    return new StepResponse({
      products,
      count: metadata?.count ?? 0,
      limit,
      offset,
    })
  },
)
