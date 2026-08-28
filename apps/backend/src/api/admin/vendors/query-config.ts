export enum Entities {
  vendor = "vendor",
}

// Vendors typically have very few users, so unlike Brand's `products`
// (opt-in only, never actually shown in Brand's own UI), `users` is
// defaulted here — the Admin UI always needs it, for the list's user
// count and the detail drawer's user list alike.
export const defaultAdminVendorFields = [
  "id",
  "name",
  "handle",
  "is_active",
  "integration_connections.provider",
  "integration_connections.external_account_identifier",
  "integration_connections.client_id",
  "integration_connections.connected_at",
  "created_at",
  "updated_at",
  "users.id",
  "users.email",
  "users.first_name",
  "users.last_name",
]

export const defaultAdminVendorAllowed = [...defaultAdminVendorFields, "deleted_at"]

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
