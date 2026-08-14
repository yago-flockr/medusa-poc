export const queryKeys = {
  products: {
    findOne: ["findOneProduct"] as const,
  },
  brands: {
    findMany: ["findManyBrands"] as const,
  },
}
