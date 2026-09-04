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
    fields: [
      "id",
      "external_id",
      "variants.id",
      "variants.title",
      "variants.sku",
    ],
    filters: { id: productId },
  })

  // External products never go through the SKU-completeness check: a
  // vendor can't edit an imported product's variants (assert-editable-
  // product.ts), so there's no way for them to ever satisfy it.
  if (product?.external_id) return

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
