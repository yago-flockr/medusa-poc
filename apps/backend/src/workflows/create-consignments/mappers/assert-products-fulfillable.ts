import { MedusaError } from "@medusajs/framework/utils"

export type FulfillabilityCandidate = {
  title?: string | null
  shipping_profile?: { id?: string | null } | null
  vendor?: { id?: string | null } | null
}

function titlesOf(products: FulfillabilityCandidate[]): string {
  return products.map((product) => product.title ?? "(untitled)").join(", ")
}

export function assertProductsFulfillable(
  products: FulfillabilityCandidate[],
): void {
  const unfulfillable = products.filter(
    (product) => !product.shipping_profile?.id,
  )

  if (unfulfillable.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Cannot complete this order — missing shipping information for: ${titlesOf(unfulfillable)}.`,
    )
  }

  // A vendor-less product can't be routed downstream (group-items-by-vendor.ts).
  const unassigned = products.filter((product) => !product.vendor?.id)

  if (unassigned.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Cannot complete this order — no vendor assigned for: ${titlesOf(unassigned)}.`,
    )
  }
}
