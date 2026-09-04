import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import {
  remapOptionTitles,
  resolveSharedProductOptionsStep,
} from "../shared/steps/resolve-shared-product-options"

export type CreateVendorProductWorkflowInput = {
  product: Omit<CreateProductWorkflowInputDTO, "options">
  options: { title: string; values: string[] }[]
  // See resolve-shared-product-options.ts for what this controls and why.
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
        products: [
          {
            ...data.input.product,
            options: data.resolvedOptions.options,
            variants: data.input.product.variants?.map((variant) => ({
              ...variant,
              options: variant.options
                ? remapOptionTitles(
                    variant.options,
                    data.resolvedOptions.canonicalTitleByNormalized,
                    data.resolvedOptions.canonicalValuesByTitle,
                  )
                : variant.options,
            })),
          },
        ],
        additional_data: { vendor_id: data.input.vendor_id },
      }),
    )

    const products = createProductsWorkflow.runAsStep({
      input: createProductsInput,
    })

    return new WorkflowResponse(products)
  },
)
