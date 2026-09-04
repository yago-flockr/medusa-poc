export function isVariantComplete(variant: { sku?: string | null }) {
  return Boolean(variant.sku)
}
