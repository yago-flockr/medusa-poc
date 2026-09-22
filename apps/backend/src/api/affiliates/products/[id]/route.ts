import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { deleteAffiliatesProductResponseSchema } from "@dtc/api-contracts/affiliate/products"
import { dismissAffiliateProductWorkflow } from "../../../../workflows/affiliate-products/dismiss-affiliate-product"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params

  await dismissAffiliateProductWorkflow(req.scope).run({
    input: { affiliateId: req.auth_context.actor_id, productId: id },
  })

  res.json(
    deleteAffiliatesProductResponseSchema.parse({
      id,
      object: "affiliate_product",
      deleted: true,
    }),
  )
}
