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
    updateProductStatus: ["updateProductStatus"] as const,
    deleteProduct: ["deleteProduct"] as const,
  },
}
