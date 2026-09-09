import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createConsignmentsWorkflow } from "../../../../../workflows/create-consignments/create-consignments"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await createConsignmentsWorkflow(req.scope).run({
    input: { cart_id: id },
  })

  res.json({ order: result.order })
}
