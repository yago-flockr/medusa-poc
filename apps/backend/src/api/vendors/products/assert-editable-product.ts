import { MedusaError } from "@medusajs/framework/utils"
import type { UpdateVendorProduct } from "@dtc/api-contracts/vendor/products"

export function assertEditableVendorProduct(
  externalId: string | null,
  body: UpdateVendorProduct,
) {
  const editsContentOnly = Object.keys(body).every((key) => key === "status")

  if (externalId && !editsContentOnly) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This product was imported from an external source and its details can't be edited here.",
    )
  }
}
