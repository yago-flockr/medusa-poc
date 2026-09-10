import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import type { GetVendorsProductCategoriesResponse } from "@dtc/api-contracts/vendor/product-categories"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { listProductCategoriesStep } from "./steps/list-product-categories"
import { buildVendorProductCategories } from "./mappers/build-vendor-product-categories"

export type ListVendorProductCategoriesWorkflowInput = {
  actorId: string
}

export const listVendorProductCategoriesWorkflow = createWorkflow(
  "list-vendor-product-categories",
  function (input: ListVendorProductCategoriesWorkflowInput) {
    resolveVendorUserStep({ actorId: input.actorId })

    const listProductCategories = listProductCategoriesStep()

    const response = transform(
      { listProductCategories },
      (data): GetVendorsProductCategoriesResponse => ({
        product_categories: buildVendorProductCategories(
          data.listProductCategories,
        ),
      }),
    )

    return new WorkflowResponse(response)
  },
)
