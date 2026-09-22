import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { buildAffiliateProducts } from "./mappers/build-affiliate-products"
import {
  listAffiliateProductsStep,
  type ListAffiliateProductsStepInput,
} from "./steps/list-affiliate-products"

export type ListAffiliateProductsWorkflowInput = ListAffiliateProductsStepInput

export const listAffiliateProductsWorkflow = createWorkflow(
  "list-affiliate-products",
  function (input: ListAffiliateProductsWorkflowInput) {
    const products = listAffiliateProductsStep(input)

    const response = transform({ products }, (data) => ({
      products: buildAffiliateProducts(data.products),
    }))

    return new WorkflowResponse(response)
  },
)
