export const mutationKeys = {
  auth: {
    postAuthVendorEmailpass: ["postAuthVendorEmailpass"] as const,
  },
  profile: {
    patchVendorsMe: ["patchVendorsMe"] as const,
  },
  shopify: {
    patchVendorsMeShopifyConnection: [
      "patchVendorsMeShopifyConnection",
    ] as const,
    getVendorsMeShopifyConnectionInstallLink: [
      "getVendorsMeShopifyConnectionInstallLink",
    ] as const,
    postVendorsMeShopifyProductsImport: [
      "postVendorsMeShopifyProductsImport",
    ] as const,
  },
  products: {
    postVendorsProducts: ["postVendorsProducts"] as const,
    postVendorsProductsById: ["postVendorsProductsById"] as const,
    deleteVendorsProductsById: ["deleteVendorsProductsById"] as const,
  },
  uploads: {
    postVendorsUploads: ["postVendorsUploads"] as const,
  },
  stockLocations: {
    postVendorsStockLocations: ["postVendorsStockLocations"] as const,
    postVendorsStockLocationsById: ["postVendorsStockLocationsById"] as const,
    deleteVendorsStockLocationsById: [
      "deleteVendorsStockLocationsById",
    ] as const,
  },
  productInventory: {
    postVendorsProductsByIdInventory: [
      "postVendorsProductsByIdInventory",
    ] as const,
  },
}
