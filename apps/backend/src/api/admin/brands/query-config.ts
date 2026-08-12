export enum Entities {
  brand = "brand",
}

export const defaultAdminBrandFields = [
  "id",
  "name",
  "handle",
  "created_at",
  "updated_at",
]

export const defaultAdminBrandAllowed = [
  ...defaultAdminBrandFields,
  "deleted_at",
  "products",
  "products.id",
  "products.title",
  "products.handle",
  "products.status",
]

export const retrieveTransformQueryConfig = {
  defaults: defaultAdminBrandFields,
  allowed: defaultAdminBrandAllowed,
  isList: false,
  entity: Entities.brand,
}

export const listTransformQueryConfig = {
  ...retrieveTransformQueryConfig,
  defaultLimit: 20,
  isList: true,
}
