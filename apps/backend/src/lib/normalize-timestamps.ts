export function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

export function toIsoStringOrNull(
  value: string | Date | null | undefined,
): string | null {
  if (value == null) {
    return null
  }

  return toIsoString(value)
}
