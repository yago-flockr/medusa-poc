export enum Entities {
  vendor = "vendor",
}

// Unlike Brand's opt-in `products`, `users` defaults here — the Admin UI
// always needs it (list count, detail drawer).
export const defaultAdminVendorFields = [
  "id",
  "name",
  "handle",
  "is_active",
  "commission_rate",
  "consignments.subtotal",
  "consignments.commission_total",
  "consignments.earning_total",
  "integration_connections.provider",
  "integration_connections.external_account_identifier",
  "integration_connections.client_id",
  "integration_connections.connected_at",
  "storefront_content.name",
  "storefront_content.description",
  "storefront_content.hero_image_url",
  "created_at",
  "updated_at",
  "users.id",
  "users.email",
  "users.name",
]

export const defaultAdminVendorAllowed = [
  ...defaultAdminVendorFields,
  "deleted_at",
]

export const retrieveTransformQueryConfig = {
  defaults: defaultAdminVendorFields,
  allowed: defaultAdminVendorAllowed,
  isList: false,
  entity: Entities.vendor,
}

export const listTransformQueryConfig = {
  ...retrieveTransformQueryConfig,
  defaultLimit: 20,
  isList: true,
}
