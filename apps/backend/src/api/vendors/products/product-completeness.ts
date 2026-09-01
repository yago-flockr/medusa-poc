export function isVariantComplete(variant: {
  sku?: string | null
  weight?: number | null
}) {
  return Boolean(variant.sku) && variant.weight != null
}
