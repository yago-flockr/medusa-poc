import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  affiliateDeleteResponseSchema,
  affiliateResponseSchema,
  type UpdateAffiliate,
} from "@dtc/api-contracts/admin/affiliates"
import { deleteAffiliateWorkflow } from "../../../../workflows/affiliates/delete-affiliate"
import { getAffiliateWorkflow } from "../../../../workflows/affiliates/get-affiliate"
import { updateAffiliateWorkflow } from "../../../../workflows/affiliates/update-affiliate"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await getAffiliateWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(affiliateResponseSchema.parse({ affiliate: result }))
}

export const POST = async (
  req: MedusaRequest<UpdateAffiliate>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  await updateAffiliateWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  const { result } = await getAffiliateWorkflow(req.scope).run({
    input: { id, queryConfig: req.queryConfig },
  })

  res.json(affiliateResponseSchema.parse({ affiliate: result }))
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  await deleteAffiliateWorkflow(req.scope).run({ input: { id } })

  res.json(
    affiliateDeleteResponseSchema.parse({
      id,
      object: "affiliate",
      deleted: true,
    }),
  )
}
