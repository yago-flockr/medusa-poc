import type { MedusaRequestHandler } from "@medusajs/framework/http"
import { parseCorsOrigins } from "@medusajs/framework/utils"

const rawOrigins = (process.env.VENDOR_CORS || process.env.STORE_CORS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

// Medusa's own storeCors/adminCors/authCors support a `/regex/flags`-shaped
// entry (see @medusajs/utils buildRegexpIfValid) alongside plain origin
// strings — Medusa Cloud's own "CORS auto-configured for the storefront"
// behavior for those three vars relies on exactly this, since a Cloud
// preview deployment's domain isn't known ahead of time. This custom
// /vendors/* CORS layer previously only ever did a plain string
// `.includes()` check, so falling back to an auto-configured STORE_CORS
// that happens to be a regex entry would compare a real Origin header
// against literal regex syntax and never match. This is the most likely
// explanation for a real prod CORS failure seen against
// /vendors/stock-locations (preflight rejected, no
// Access-Control-Allow-Origin header) — not confirmed against the actual
// Cloud env var value, since that isn't inspectable from here, but this is
// a genuine correctness gap either way: reuses Medusa's own parser instead
// of re-deriving the regex-detection logic here.
const allowedOrigins = parseCorsOrigins(rawOrigins.join(","))

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.some((allowed) =>
    allowed instanceof RegExp ? allowed.test(origin) : allowed === origin,
  )
}

function isAbsoluteOrigin(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

// Must be a concrete origin, not a regex entry: Cloud auto-configures
// STORE_CORS as a regex, which res.redirect would emit as a relative path.
export const vendorPanelOrigin = rawOrigins.find(isAbsoluteOrigin)

export const vendorCors: MedusaRequestHandler = (req, res, next) => {
  const origin = req.headers.origin

  if (origin && isAllowedOrigin(origin)) {
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
