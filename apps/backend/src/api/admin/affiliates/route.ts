import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  affiliateListResponseSchema,
  affiliateResponseSchema,
  affiliateWithPasswordResponseSchema,
  type CreateAffiliate,
} from "@dtc/api-contracts/admin/affiliates"
import { createAffiliateWorkflow } from "../../../workflows/affiliates/create-affiliate"
import { listAffiliatesWorkflow } from "../../../workflows/affiliates/list-affiliates"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listAffiliatesWorkflow(req.scope).run({
    input: { filters: req.filterableFields, queryConfig: req.queryConfig },
  })

  res.json(affiliateListResponseSchema.parse(result))
}

export const POST = async (
  req: MedusaRequest<CreateAffiliate>,
  res: MedusaResponse,
) => {
  const { result } = await createAffiliateWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json(affiliateWithPasswordResponseSchema.parse(result))
}
