import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { regenerateVendorUserPasswordWorkflow } from "../../../../../workflows/regenerate-vendor-user-password"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await regenerateVendorUserPasswordWorkflow(
    req.scope,
  ).run({
    input: { vendorUserId: id },
  })

  res.json({ password: result.password })
}
