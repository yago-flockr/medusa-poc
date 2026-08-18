import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function assertOwnedVendorProduct(
  query: Omit<RemoteQueryFunction, symbol>,
  productId: string,
  vendorId: string | undefined,
) {
  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: ["id", "vendor.id"],
    filters: { id: productId },
  })

  const productVendorId = (product as { vendor?: { id: string } | null })
    ?.vendor?.id

  if (!product || productVendorId !== vendorId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id: ${productId} was not found`,
    )
  }
}
