import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function assertOwnedVendorVariant(
  query: Omit<RemoteQueryFunction, symbol>,
  variantId: string,
  vendorId: string | undefined,
) {
  const {
    data: [variant],
  } = await query.graph({
    entity: "variant",
    fields: ["id", "product.vendor.id"],
    filters: { id: variantId },
  })

  const variantVendorId = (
    variant as { product?: { vendor?: { id: string } | null } } | undefined
  )?.product?.vendor?.id

  if (!variant || variantVendorId !== vendorId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Variant with id: ${variantId} was not found`,
    )
  }
}
