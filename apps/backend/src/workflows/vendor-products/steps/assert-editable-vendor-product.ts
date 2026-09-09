import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

// The external source (e.g. Shopify) owns these — they'd be overwritten on
// the next sync anyway.
const EXTERNAL_LOCKED_FIELDS = new Set([
  "title",
  "subtitle",
  "description",
  "images",
])

export type AssertEditableVendorProductStepInput = {
  externalId: string | null
  fields: Record<string, unknown>
}

export const assertEditableVendorProductStep = createStep(
  "assert-editable-vendor-product",
  async ({ externalId, fields }: AssertEditableVendorProductStepInput) => {
    const touchesLockedField = Object.keys(fields).some((key) =>
      EXTERNAL_LOCKED_FIELDS.has(key),
    )

    if (externalId && touchesLockedField) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This product was imported from an external source — its title, subtitle, description, and images can't be edited here.",
      )
    }
  },
)
