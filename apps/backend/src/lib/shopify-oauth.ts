import crypto from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

/**
 * Verifies Shopify's HMAC signature on an OAuth callback query string.
 * Without this, anyone could POST/GET a forged ?shop=&code= to our
 * callback and trick us into "connecting" a store we were never
 * authorized for.
 */
export function verifyShopifyCallbackHmac(
  query: Record<string, string>,
  clientSecret: string,
): boolean {
  const { hmac, ...rest } = query
  if (!hmac) {
    return false
  }

  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("&")

  const digest = crypto.createHmac("sha256", clientSecret).update(message).digest("hex")
  const digestBuffer = Buffer.from(digest)
  const hmacBuffer = Buffer.from(hmac)

  if (digestBuffer.length !== hmacBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(digestBuffer, hmacBuffer)
}

export async function exchangeShopifyCodeForToken(
  shop: string,
  clientId: string,
  clientSecret: string,
  code: string,
): Promise<{ access_token: string; scope: string }> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })

  if (!res.ok) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Shopify token exchange failed: ${res.status} ${await res.text()}`,
    )
  }

  return (await res.json()) as { access_token: string; scope: string }
}
