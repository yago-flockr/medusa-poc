import { MedusaError } from "@medusajs/framework/utils"
import type { PostVendorsProductsByIdInput } from "@dtc/api-contracts/vendor/products"

// The external source (e.g. Shopify) stays the source of truth for these —
// they'd just get overwritten on the next sync anyway. Everything else
// (status, handle, and each variant's price/sku via `variants`) is the
// vendor's own to manage regardless of where the product came from.
const EXTERNAL_LOCKED_FIELDS = new Set(["title", "subtitle", "description", "images"])

export function assertEditableVendorProduct(
  externalId: string | null,
  body: PostVendorsProductsByIdInput,
) {
  const touchesLockedField = Object.keys(body).some((key) =>
    EXTERNAL_LOCKED_FIELDS.has(key),
  )

  if (externalId && touchesLockedField) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This product was imported from an external source — its title, subtitle, description, and images can't be edited here.",
    )
  }
}
