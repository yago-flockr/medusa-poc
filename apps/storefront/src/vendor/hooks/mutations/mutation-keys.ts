export const mutationKeys = {
  auth: {
    login: ["loginVendor"] as const,
  },
  shopify: {
    setConnection: ["setVendorShopifyConnection"] as const,
    getInstallLink: ["getVendorShopifyInstallLink"] as const,
    pullProducts: ["pullVendorShopifyProducts"] as const,
  },
}
