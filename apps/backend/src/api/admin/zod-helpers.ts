import { z } from "@medusajs/framework/zod"

function trimOrUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function requiredTrimmedString(message: string) {
  return z.string().trim().min(1, message)
}

export function optionalTrimmedString() {
  return z.string().transform(trimOrUndefined).optional()
}

function trimOrNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function optionalTrimmedStringOrNull() {
  return z.string().transform(trimOrNull).optional()
}
