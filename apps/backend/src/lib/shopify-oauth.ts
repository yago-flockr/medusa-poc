import crypto from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

export function parseRawQuery(rawQuery: string): Record<string, string> {
  const result: Record<string, string> = {}

  for (const pair of rawQuery.split("&")) {
    if (!pair) {
      continue
    }

    const eqIndex = pair.indexOf("=")
    const key = eqIndex === -1 ? pair : pair.slice(0, eqIndex)
    const value = eqIndex === -1 ? "" : pair.slice(eqIndex + 1)
    result[decodeURIComponent(key)] = decodeURIComponent(value)
  }

  return result
}

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

export async function uninstallShopifyApp(shop: string, accessToken: string): Promise<void> {
  await fetch(`https://${shop}/admin/api/2026-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `mutation { appUninstall { userErrors { field message } } }`,
    }),
  })
}
