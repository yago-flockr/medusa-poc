export type SeedRange = { min: number; max: number }

export type SeedConfig = {
  randomSeed: number
  password: string
  staff: string[]
  vendors: string[]
  affiliates: string[]
  categories: SeedRange
  collections: SeedRange
  productsPerVendor: SeedRange
  locationsPerVendor: SeedRange
  ordersPerVendor: SeedRange
  productsPerAffiliate: SeedRange
  ordersPerAffiliate: SeedRange
  productsPerCategory: SeedRange
  productsPerCollection: SeedRange
  vendorsPerOrder: SeedRange
  affiliatesPerOrder: SeedRange
  productsPerOrder: SeedRange
  quantityPerOrderItem: SeedRange
  productOptions: Record<string, string[]>
  productOptionSets: string[][]
  productPrice: SeedRange
  stockPerVariant: SeedRange
  commissionRate: SeedRange
}

export const SEED_CONFIG: SeedConfig = {
  randomSeed: 1,
  password: "123",

  staff: ["admin"],
  vendors: ["main", "qwe", "asd", "zxc"],
  affiliates: ["main", "qwe", "asd", "zxc"],
  categories: { min: 6, max: 6 },
  collections: { min: 2, max: 2 },

  productsPerVendor: { min: 4, max: 8 },
  locationsPerVendor: { min: 1, max: 2 },
  ordersPerVendor: { min: 2, max: 4 },

  productsPerAffiliate: { min: 4, max: 8 },
  ordersPerAffiliate: { min: 2, max: 4 },

  productsPerCategory: { min: 4, max: 8 },
  productsPerCollection: { min: 4, max: 8 },

  vendorsPerOrder: { min: 1, max: 4 },
  affiliatesPerOrder: { min: 0, max: 1 },
  productsPerOrder: { min: 1, max: 8 },
  quantityPerOrderItem: { min: 1, max: 3 },

  productOptions: {
    Size: ["S", "M", "L"],
    Color: ["Black", "White", "Grey"],
  },
  productOptionSets: [[], ["Size"], ["Color"], ["Size", "Color"]],
  productPrice: { min: 15, max: 120 },
  stockPerVariant: { min: 50, max: 150 },
  commissionRate: { min: 0.05, max: 0.2 },
}
