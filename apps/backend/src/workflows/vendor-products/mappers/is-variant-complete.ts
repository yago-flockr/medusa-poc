export function isVariantComplete(variant: { sku?: string | null }): boolean {
  return Boolean(variant.sku)
}
