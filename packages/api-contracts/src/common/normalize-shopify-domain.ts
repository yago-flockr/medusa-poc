export function normalizeShopifyStoreDomain(value: string): string {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase()
}
