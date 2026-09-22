import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  getAffiliatesProductsResponseSchema,
  type PostAffiliatesProductsInput,
} from "@dtc/api-contracts/affiliate/products"
import { listAffiliateProductsWorkflow } from "../../../workflows/affiliate-products/list-affiliate-products"
import { promoteAffiliateProductWorkflow } from "../../../workflows/affiliate-products/promote-affiliate-product"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await listAffiliateProductsWorkflow(req.scope).run({
    input: { affiliateId: req.auth_context.actor_id },
  })

  res.json(getAffiliatesProductsResponseSchema.parse(result))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAffiliatesProductsInput>,
  res: MedusaResponse,
) => {
  const { result } = await promoteAffiliateProductWorkflow(req.scope).run({
    input: {
      affiliateId: req.auth_context.actor_id,
      productId: req.validatedBody.product_id,
    },
  })

  res.json(getAffiliatesProductsResponseSchema.parse(result))
}
