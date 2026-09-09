import { ProductStatus } from "@medusajs/framework/utils"
import { isVariantComplete } from "./is-variant-complete"

export function deriveProductStatus(
  variants: { sku?: string | null }[],
): ProductStatus {
  return variants.every(isVariantComplete)
    ? ProductStatus.PROPOSED
    : ProductStatus.DRAFT
}
