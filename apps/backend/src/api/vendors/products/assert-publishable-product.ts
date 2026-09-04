import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"
import { isVariantComplete } from "./product-completeness"

export async function assertPublishableVendorProduct(
  query: Omit<RemoteQueryFunction, symbol>,
  productId: string,
) {
  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id", "variants.title", "variants.sku"],
    filters: { id: productId },
  })

  const incompleteVariants = (product?.variants ?? []).filter(
    (variant) => !variant || !isVariantComplete(variant),
  )

  if (incompleteVariants.length > 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Cannot publish product: variant(s) missing SKU: ${incompleteVariants
        .map((variant) => variant?.title)
        .join(", ")}`,
    )
  }
}
