export const mutationKeys = {
  auth: {
    login: ["loginVendor"] as const,
  },
  profile: {
    updateProfile: ["updateProfile"] as const,
  },
  shopify: {
    setShopifyConnection: ["setShopifyConnection"] as const,
    getShopifyInstallLink: ["getShopifyInstallLink"] as const,
    importShopifyProducts: ["importShopifyProducts"] as const,
  },
  products: {
    createProduct: ["createProduct"] as const,
    updateProduct: ["updateProduct"] as const,
    deleteProduct: ["deleteProduct"] as const,
  },
  uploads: {
    uploadVendorImages: ["uploadVendorImages"] as const,
  },
  stockLocations: {
    createStockLocation: ["createStockLocation"] as const,
  },
  productInventory: {
    setProductInventory: ["setProductInventory"] as const,
  },
}
