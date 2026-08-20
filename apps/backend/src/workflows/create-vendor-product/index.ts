import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { resolveSharedProductOptionsStep } from "./steps/resolve-shared-product-options"

export type CreateVendorProductWorkflowInput = {
  product: Omit<CreateProductWorkflowInputDTO, "options">
  options: { title: string; values: string[] }[]
  // True only when the vendor explicitly provided options (Size, Color,
  // ...) — these should become shared/filterable. False for the synthetic
  // "Default" option used when a vendor creates a single-variant product
  // with no real options, which must stay exclusive to that one product.
  shared: boolean
  vendor_id: string
}

export const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  function (input: CreateVendorProductWorkflowInput) {
    const resolvedOptions = resolveSharedProductOptionsStep({
      options: input.options,
      shared: input.shared,
    })

    const createProductsInput = transform(
      { input, resolvedOptions },
      (data) => ({
        products: [{ ...data.input.product, options: data.resolvedOptions }],
        additional_data: { vendor_id: data.input.vendor_id },
      }),
    )

    const products = createProductsWorkflow.runAsStep({
      input: createProductsInput,
    })

    return new WorkflowResponse(products)
  },
)
