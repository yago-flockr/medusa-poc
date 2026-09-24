export enum Entities {
  affiliate = "affiliate",
}

export const defaultStoreAffiliateFields = [
  "id",
  "name",
  "handle",
  "storefront_content.name",
  "storefront_content.description",
  "storefront_content.hero_image_url",
]

export const listStoreAffiliateQueryConfig = {
  defaults: defaultStoreAffiliateFields,
  allowed: [...defaultStoreAffiliateFields, "products.id"],
  isList: true,
  defaultLimit: 20,
  entity: Entities.affiliate,
}
