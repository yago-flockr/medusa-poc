import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"
import {
  createVendorSchema,
  updateVendorSchema,
  vendorListFiltersSchema,
} from "./contract"

export const AdminGetVendorParams = createSelectParams()

export const AdminGetVendorsParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(vendorListFiltersSchema)

export const AdminCreateVendor = createVendorSchema

export const AdminUpdateVendor = updateVendorSchema
