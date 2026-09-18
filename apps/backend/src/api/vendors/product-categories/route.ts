import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getVendorsProductCategoriesResponseSchema } from "@dtc/api-contracts/vendor/product-categories"
import { listVendorProductCategoriesWorkflow } from "../../../workflows/vendor-product-categories/list-vendor-product-categories"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { result } = await listVendorProductCategoriesWorkflow(req.scope).run({
    input: { actorId: req.auth_context.actor_id },
  })

  res.json(getVendorsProductCategoriesResponseSchema.parse(result))
}
