export const mutationKeys = {
  auth: {
    postAuthVendorEmailpass: ["postAuthVendorEmailpass"] as const,
  },
  profile: {
    patchVendorsMe: ["patchVendorsMe"] as const,
  },
  shopify: {
    patchVendorsShopifyConnection: ["patchVendorsShopifyConnection"] as const,
    getVendorsShopifyConnectionInstallLink: [
      "getVendorsShopifyConnectionInstallLink",
    ] as const,
    postVendorsShopifyProductsImport: [
      "postVendorsShopifyProductsImport",
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
  orders: {
    postVendorsOrdersByIdAccept: ["postVendorsOrdersByIdAccept"] as const,
    postVendorsOrdersByIdDispatch: ["postVendorsOrdersByIdDispatch"] as const,
  },
}
