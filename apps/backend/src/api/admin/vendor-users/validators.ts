import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"
import {
  createVendorUserSchema,
  updateVendorUserSchema,
  vendorUserListFiltersSchema,
} from "@dtc/api-contracts/admin/vendor-users"

export const AdminGetVendorUserParams = createSelectParams()

export const AdminGetVendorUsersParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(vendorUserListFiltersSchema)

export const AdminCreateVendorUser = createVendorUserSchema

export const AdminUpdateVendorUser = updateVendorUserSchema
