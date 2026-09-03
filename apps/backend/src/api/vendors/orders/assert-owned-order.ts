import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function assertOwnedVendorOrder(
  query: Omit<RemoteQueryFunction, symbol>,
  orderId: string,
  vendorId: string | undefined,
) {
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "vendor.id"],
    filters: { id: orderId },
  })

  const orderVendorId = (
    order as { vendor?: { id: string } | null } | undefined
  )?.vendor?.id

  if (!order || orderVendorId !== vendorId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order with id: ${orderId} was not found`,
    )
  }
}
