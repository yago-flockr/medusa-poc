import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listVendorShippingOptionsWorkflow } from "../../../../../workflows/vendor-shipping-options/list-vendor-shipping-options"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: cartId } = req.params

  const { result } = await listVendorShippingOptionsWorkflow(req.scope).run({
    input: { cartId },
  })

  res.json(result)
}
