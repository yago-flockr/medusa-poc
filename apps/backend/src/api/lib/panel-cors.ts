import type { MedusaRequestHandler } from "@medusajs/framework/http"
import { parseCorsOrigins } from "@medusajs/framework/utils"

// Medusa applies storeCors to /store/* only, so the custom panel routes
// (/vendors/*, /affiliates/*) need their own layer. They are served from the
// storefront, so they share STORE_CORS — which Cloud may set as a regex.
const allowedOrigins = parseCorsOrigins(process.env.STORE_CORS || "")

export const panelCors: MedusaRequestHandler = (req, res, next) => {
  const origin = req.headers.origin

  const isAllowed =
    origin &&
    allowedOrigins.some((allowed) =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin,
    )

  if (origin && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,DELETE,OPTIONS",
    )
    res.setHeader("Access-Control-Allow-Headers", "content-type,authorization")
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(200)
    return
  }

  next()
}
