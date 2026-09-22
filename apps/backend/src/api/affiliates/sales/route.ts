import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getAffiliatesSalesResponseSchema } from "@dtc/api-contracts/affiliate/sales"
import { getAffiliateProductSalesWorkflow } from "../../../workflows/affiliate-sales/get-affiliate-product-sales"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await getAffiliateProductSalesWorkflow(req.scope).run({
    input: { affiliate_id: req.auth_context.actor_id },
  })

  res.json(getAffiliatesSalesResponseSchema.parse(result))
}
