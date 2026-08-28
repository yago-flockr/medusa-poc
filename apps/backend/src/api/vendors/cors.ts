import type { MedusaRequestHandler } from "@medusajs/framework/http"

const allowedOrigins = (process.env.VENDOR_CORS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

export const vendorPanelOrigin = allowedOrigins[0]

export const vendorCors: MedusaRequestHandler = (req, res, next) => {
  const origin = req.headers.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "content-type,authorization")
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(200)
    return
  }

  next()
}
