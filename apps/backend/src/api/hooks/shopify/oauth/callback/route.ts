import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { completeVendorShopifyConnectionWorkflow } from "../../../../../workflows/complete-vendor-shopify-connection"
import { parseRawQuery } from "../../../../../lib/shopify-oauth"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = parseRawQuery(req.originalUrl.split("?")[1] ?? "")
  const { shop, code } = query

  res.setHeader("Content-Type", "text/html")

  if (!shop || !code) {
    res.status(400)
    res.send("Missing shop or code in Shopify's callback.")
    return
  }

  try {
    await completeVendorShopifyConnectionWorkflow(req.scope).run({
      input: { shop, code, query },
    })
  } catch (error) {
    res.status(400)
    res.send(
      `Couldn't finish connecting ${escapeHtml(shop)} to Shopify. Please ask us to send a new install link. (${escapeHtml(
        error instanceof Error ? error.message : "unknown error",
      )})`,
    )
    return
  }

  res.send(
    `<html><body><h1>You're connected!</h1><p>${escapeHtml(shop)} is now linked. You can close this tab.</p></body></html>`,
  )
}
