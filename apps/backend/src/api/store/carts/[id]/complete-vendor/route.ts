import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createVendorOrdersWorkflow } from "../../../../../workflows/create-vendor-orders"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await createVendorOrdersWorkflow(req.scope).run({
    input: { cart_id: id },
  })

  res.json({ order: result.order })
}
