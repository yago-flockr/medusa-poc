import type { VendorUserListResponse } from "@dtc/api-contracts/admin/vendor-users"
import { buildVendorUser } from "./build-vendor-user"

type RawVendorUser = Parameters<typeof buildVendorUser>[0]

export function buildVendorUserList(result: {
  vendorUsers: RawVendorUser[]
  count: number
  limit: number
  offset: number
}): VendorUserListResponse {
  return {
    vendor_users: result.vendorUsers.map(buildVendorUser),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
  }
}
