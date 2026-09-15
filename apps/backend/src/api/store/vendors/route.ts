import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listVendorsWorkflow } from "../../../workflows/vendors/list-vendors"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await listVendorsWorkflow(req.scope).run({
    input: {
      filters: { ...req.filterableFields, is_active: true },
      queryConfig: req.queryConfig,
    },
  })

  res.json(result)
}
