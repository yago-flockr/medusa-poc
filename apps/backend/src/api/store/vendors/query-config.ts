export enum Entities {
  vendor = "vendor",
}

export const defaultStoreVendorFields = [
  "id",
  "name",
  "handle",
  "storefront_content.name",
  "storefront_content.description",
  "storefront_content.hero_image_url",
]

export const listStoreVendorQueryConfig = {
  defaults: defaultStoreVendorFields,
  allowed: [...defaultStoreVendorFields, "products.id"],
  isList: true,
  defaultLimit: 20,
  entity: Entities.vendor,
}
