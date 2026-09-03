export const queryKeys = {
  vendor: {
    getVendorsMe: ["getVendorsMe"] as const,
  },
  orders: {
    getVendorsOrders: ["getVendorsOrders"] as const,
    getVendorsOrdersById: (orderId: string) =>
      ["getVendorsOrdersById", orderId] as const,
  },
  shopifyProducts: {
    getVendorsMeShopifyProducts: ["getVendorsMeShopifyProducts"] as const,
  },
  products: {
    getVendorsProducts: ["getVendorsProducts"] as const,
    getVendorsProductsById: (productId: string) =>
      ["getVendorsProductsById", productId] as const,
  },
  stockLocations: {
    getVendorsStockLocations: ["getVendorsStockLocations"] as const,
  },
  productInventory: {
    getVendorsProductsByIdInventory: (productId: string) =>
      ["getVendorsProductsByIdInventory", productId] as const,
  },
}
