import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { generateVendorShopifyInstallLinkResponseSchema } from "@dtc/api-contracts/admin/vendor-shopify"
import { generateVendorShopifyInstallLinkWorkflow } from "../../../../../../../workflows/vendor-shopify-connection/generate-vendor-shopify-install-link"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  const host = req.get("x-forwarded-host") ?? req.get("host")
  if (!host) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Request is missing a Host header",
    )
  }

  const { result } = await generateVendorShopifyInstallLinkWorkflow(
    req.scope,
  ).run({
    input: {
      vendorId: id,
      notConfiguredMessage: `Vendor ${id} is missing its Shopify store domain/client id — set them via PATCH /admin/vendors/${id} first.`,
      protocol: req.get("x-forwarded-proto") ?? req.protocol,
      host,
    },
  })

  res.json(generateVendorShopifyInstallLinkResponseSchema.parse(result))
}
