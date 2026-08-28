import { QueryClient } from "@tanstack/react-query"

export const vendorQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})
