import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { completeVendorShopifyConnectionWorkflow } from "../../../../../workflows/complete-vendor-shopify-connection"

/**
 * shop/code/error come straight off the query string, unauthenticated, and
 * get echoed back into an HTML response below — escape before interpolating
 * or this is a reflected-XSS sink (an attacker doesn't need a valid HMAC to
 * reach the error path, since that's thrown before HMAC verification runs).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Shopify redirects the vendor's own browser here after they approve the
 * install — there's no session, no publishable key, nothing to auth as,
 * which is why this lives outside /admin and /store. The response is plain
 * HTML because a real vendor's browser lands on it directly.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.query as Record<string, string>
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
