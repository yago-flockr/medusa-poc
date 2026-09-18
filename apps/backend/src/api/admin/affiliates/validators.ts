import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"
import {
  affiliateListFiltersSchema,
  createAffiliateSchema,
  updateAffiliateSchema,
} from "@dtc/api-contracts/admin/affiliates"

export const AdminGetAffiliateParams = createSelectParams()

export const AdminGetAffiliatesParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(affiliateListFiltersSchema)

export const AdminCreateAffiliate = createAffiliateSchema

export const AdminUpdateAffiliate = updateAffiliateSchema
