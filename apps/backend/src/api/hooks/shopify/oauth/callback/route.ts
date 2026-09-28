import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { completeVendorShopifyConnectionWorkflow } from "../../../../../workflows/vendor-shopify-connection/complete-vendor-shopify-connection"
import { parseRawQuery } from "../../../../../integrations/shopify/oauth"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const panelUrl = process.env.PANEL_URL

  if (!panelUrl) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "PANEL_URL must be set to the origin serving the vendor panel (e.g. https://example.com) for the Shopify OAuth redirect",
    )
  }

  const query = parseRawQuery(req.originalUrl.split("?")[1] ?? "")
  const { shop, code } = query

  if (!shop || !code) {
    res.redirect(`${panelUrl}/vendor/shopify`)
    return
  }

  try {
    await completeVendorShopifyConnectionWorkflow(req.scope).run({
      input: { shop, code, query },
    })
  } catch (error) {
    console.error("Couldn't complete Shopify OAuth connection:", error)
    const message = MedusaError.isMedusaError(error)
      ? error.message
      : "Couldn't connect to Shopify. Please try again."
    res.redirect(
      `${panelUrl}/vendor/shopify?error=${encodeURIComponent(message)}`,
    )
    return
  }

  res.redirect(`${panelUrl}/vendor/shopify`)
}
