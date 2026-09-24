import type { VendorUser } from "@dtc/api-contracts/admin/vendor-users"
import { toIsoString } from "../../../lib/normalize-timestamps"

type RawVendorUser = {
  id: string
  vendor_id: string
  // A module-service write returns only a stub `{id}` relation, never `name`.
  vendor?: { id: string; name?: string } | null
  name: string | null
  email: string
  is_active: boolean
  created_at: string | Date
  updated_at: string | Date
}

export function buildVendorUser(vendorUser: RawVendorUser): VendorUser {
  return {
    id: vendorUser.id,
    vendor_id: vendorUser.vendor_id,
    vendor:
      vendorUser.vendor?.name !== undefined
        ? { id: vendorUser.vendor.id, name: vendorUser.vendor.name }
        : undefined,
    name: vendorUser.name,
    email: vendorUser.email,
    is_active: vendorUser.is_active,
    created_at: toIsoString(vendorUser.created_at),
    updated_at: toIsoString(vendorUser.updated_at),
  }
}
