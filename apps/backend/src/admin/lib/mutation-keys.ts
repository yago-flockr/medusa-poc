export const mutationKeys = {
  brands: {
    createOne: ["createOneBrand"] as const,
    updateOne: ["updateOneBrand"] as const,
    deleteOne: ["deleteOneBrand"] as const,
  },
  vendors: {
    createOne: ["createOneVendor"] as const,
    updateOne: ["updateOneVendor"] as const,
    pullShopifyProducts: ["pullVendorShopifyProducts"] as const,
  },
  vendorUsers: {
    createOne: ["createOneVendorUser"] as const,
    updateOne: ["updateOneVendorUser"] as const,
    regeneratePassword: ["regenerateVendorUserPassword"] as const,
  },
}
