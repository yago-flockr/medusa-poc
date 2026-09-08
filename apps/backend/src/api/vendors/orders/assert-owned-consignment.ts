import { MedusaError } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

export async function assertOwnedConsignment(
  query: Omit<RemoteQueryFunction, symbol>,
  consignmentId: string,
  vendorId: string | undefined,
) {
  const {
    data: [consignment],
  } = await query.graph({
    entity: "consignment",
    fields: ["id", "vendor.id"],
    filters: { id: consignmentId },
  })

  const consignmentVendorId = (
    consignment as { vendor?: { id: string } | null } | undefined
  )?.vendor?.id

  if (!consignment || consignmentVendorId !== vendorId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Consignment with id: ${consignmentId} was not found`,
    )
  }
}
