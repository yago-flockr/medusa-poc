import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listAffiliatesWorkflow } from "../../../workflows/affiliates/list-affiliates"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listAffiliatesWorkflow(req.scope).run({
    input: {
      filters: { ...req.filterableFields, is_active: true },
      queryConfig: req.queryConfig,
    },
  })

  res.json(result)
}
