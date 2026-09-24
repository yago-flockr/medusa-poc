export enum Entities {
  vendorUser = "vendor_user",
}

export const defaultAdminVendorUserFields = [
  "id",
  "vendor_id",
  "vendor.id",
  "vendor.name",
  "name",
  "email",
  "is_active",
  "created_at",
  "updated_at",
]

export const retrieveTransformQueryConfig = {
  defaults: defaultAdminVendorUserFields,
  allowed: defaultAdminVendorUserFields,
  isList: false,
  entity: Entities.vendorUser,
}

export const listTransformQueryConfig = {
  ...retrieveTransformQueryConfig,
  defaultLimit: 20,
  isList: true,
}
