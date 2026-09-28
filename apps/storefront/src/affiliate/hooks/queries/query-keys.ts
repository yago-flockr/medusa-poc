export const queryKeys = {
  me: ["getAffiliatesMe"] as const,
  products: ["getAffiliatesProducts"] as const,
  orders: ["getAffiliatesOrders"] as const,
  ordersById: (id: string) => ["getAffiliatesOrdersById", id] as const,
  sales: ["getAffiliatesSales"] as const,
}
