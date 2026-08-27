import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { completeVendorShopifyConnectionWorkflow } from "../../../../../workflows/complete-vendor-shopify-connection"
import { parseRawQuery } from "../../../../../integrations/shopify/oauth"
import { vendorPanelOrigin } from "../../../../vendors/cors"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!vendorPanelOrigin) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "VENDOR_CORS is not configured")
  }

  const query = parseRawQuery(req.originalUrl.split("?")[1] ?? "")
  const { shop, code } = query

  if (!shop || !code) {
    res.redirect(`${vendorPanelOrigin}/vendor/shopify`)
    return
  }

  try {
    await completeVendorShopifyConnectionWorkflow(req.scope).run({
      input: { shop, code, query },
    })
  } catch (error) {
    console.error("Couldn't complete Shopify OAuth connection:", error)
  }

  res.redirect(`${vendorPanelOrigin}/vendor/shopify`)
}
