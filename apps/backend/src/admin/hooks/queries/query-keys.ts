export const queryKeys = {
  products: {
    findOne: ["findOneProduct"] as const,
  },
  productCategories: {
    findOne: ["findOneProductCategory"] as const,
  },
  collections: {
    findOne: ["findOneCollection"] as const,
  },
  brands: {
    findMany: ["findManyBrands"] as const,
  },
  vendors: {
    findMany: ["findManyVendors"] as const,
    findOne: ["findOneVendor"] as const,
  },
  vendorUsers: {
    findMany: ["findManyVendorUsers"] as const,
  },
  affiliates: {
    findMany: ["findManyAffiliates"] as const,
  },
}
