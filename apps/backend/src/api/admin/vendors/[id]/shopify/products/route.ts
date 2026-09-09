import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { pullVendorShopifyProductsWorkflow } from "../../../../../../workflows/vendor-shopify-products/pull-vendor-shopify-products"
import { pullVendorShopifyProductsResponseSchema } from "@dtc/api-contracts/admin/vendor-shopify"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const { result } = await pullVendorShopifyProductsWorkflow(req.scope).run({
    input: { vendorId: id },
  })

  res.json(pullVendorShopifyProductsResponseSchema.parse(result))
}
