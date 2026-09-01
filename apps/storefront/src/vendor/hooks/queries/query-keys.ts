export const queryKeys = {
  vendor: {
    getMe: ["getMe"] as const,
  },
  orders: {
    getOrders: ["getOrders"] as const,
  },
  shopifyProducts: {
    pullShopifyProducts: ["pullShopifyProducts"] as const,
  },
  products: {
    getProducts: ["getProducts"] as const,
  },
  stockLocations: {
    getStockLocations: ["getStockLocations"] as const,
  },
  productInventory: {
    getProductInventory: (productId: string) =>
      ["getProductInventory", productId] as const,
  },
}
