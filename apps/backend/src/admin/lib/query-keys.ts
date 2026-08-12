export const queryKeys = {
  products: {
    all: ["products"] as const,
    byId: (id: string) => [...queryKeys.products.all, id] as const,
    byQuery: (query?: unknown) => [...queryKeys.products.all, query] as const,
  },
  brands: {
    all: ["brands"] as const,
    byId: (id: string) => [...queryKeys.brands.all, id] as const,
    byQuery: (query?: unknown) => [...queryKeys.brands.all, query] as const,
  },
}
