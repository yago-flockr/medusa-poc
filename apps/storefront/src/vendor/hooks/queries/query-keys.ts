export const queryKeys = {
  vendor: {
    findOne: ["findOneVendor"] as const,
  },
  orders: {
    findMany: ["findManyVendorOrders"] as const,
  },
}
