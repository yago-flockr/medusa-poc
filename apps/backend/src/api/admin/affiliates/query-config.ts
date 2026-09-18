export enum Entities {
  affiliate = "affiliate",
}

export const defaultAdminAffiliateFields = [
  "id",
  "name",
  "handle",
  "email",
  "commission_rate",
  "is_active",
  "created_at",
  "updated_at",
]

export const defaultAdminAffiliateAllowed = [
  ...defaultAdminAffiliateFields,
  "deleted_at",
]

export const retrieveTransformQueryConfig = {
  defaults: defaultAdminAffiliateFields,
  allowed: defaultAdminAffiliateAllowed,
  isList: false,
  entity: Entities.affiliate,
}

export const listTransformQueryConfig = {
  ...retrieveTransformQueryConfig,
  defaultLimit: 20,
  isList: true,
}
