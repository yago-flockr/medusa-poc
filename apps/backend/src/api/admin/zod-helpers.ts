import { z } from "@medusajs/framework/zod"

function trimOrUndefined(value?: string) {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function requiredTrimmedString(message: string) {
  return z.string().trim().min(1, message)
}

export function optionalTrimmedString() {
  return z.string().optional().transform(trimOrUndefined)
}

function trimOrNull(value?: string) {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function optionalTrimmedStringOrNull() {
  return z.string().optional().transform(trimOrNull)
}
