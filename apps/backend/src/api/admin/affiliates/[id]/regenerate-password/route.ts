import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { regenerateAffiliatePasswordResponseSchema } from "@dtc/api-contracts/admin/affiliates"
import { regenerateAffiliatePasswordWorkflow } from "../../../../../workflows/affiliates/regenerate-affiliate-password"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await regenerateAffiliatePasswordWorkflow(req.scope).run({
    input: { affiliateId: id },
  })

  res.json(
    regenerateAffiliatePasswordResponseSchema.parse({
      password: result.password,
    }),
  )
}
