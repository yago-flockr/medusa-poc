import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"
import {
  brandListFiltersSchema,
  createBrandSchema,
  updateBrandSchema,
} from "@dtc/api-contracts/admin/brands"

export const AdminGetBrandParams = createSelectParams()

export const AdminGetBrandsParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(brandListFiltersSchema)

export const AdminCreateBrand = createBrandSchema

export const AdminUpdateBrand = updateBrandSchema
