import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { AFFILIATE_MODULE } from "../../modules/affiliate"
import { assertProductIsPromotableStep } from "./steps/assert-product-is-promotable"
import { buildAffiliateProducts } from "./mappers/build-affiliate-products"
import { listAffiliateProductsStep } from "./steps/list-affiliate-products"

export type PromoteAffiliateProductWorkflowInput = {
  affiliateId: string
  productId: string
}

export const promoteAffiliateProductWorkflow = createWorkflow(
  "promote-affiliate-product",
  function (input: PromoteAffiliateProductWorkflowInput) {
    assertProductIsPromotableStep(input)

    const linkDefs = transform({ input }, (data): LinkDefinition[] => [
      {
        [AFFILIATE_MODULE]: { affiliate_id: data.input.affiliateId },
        [Modules.PRODUCT]: { product_id: data.input.productId },
      },
    ])

    createRemoteLinkStep(linkDefs)

    const products = listAffiliateProductsStep({
      affiliateId: input.affiliateId,
    })

    const response = transform({ products }, (data) => ({
      products: buildAffiliateProducts(data.products),
    }))

    return new WorkflowResponse(response)
  },
)
