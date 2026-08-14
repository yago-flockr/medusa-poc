import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

// For custom modules only (no Medusa SDK support, so every operation is a
// hand-written sdk.client.fetch call). A core resource with a typed SDK
// method (sdk.admin.<resource>.*) should wrap it directly with useQuery
// instead — there's no repeated fetch/key wiring left for this to remove.
type ResourceQueryConfig<TQuery, TData> = {
  queryKey: (query: TQuery) => readonly unknown[]
  queryFn: (query: TQuery) => Promise<TData>
}

export function createResourceQueryHook<TQuery, TData>(
  config: ResourceQueryConfig<TQuery, TData>
) {
  return function useResourceQuery(
    query: TQuery,
    options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
  ) {
    return useQuery({
      queryKey: config.queryKey(query),
      queryFn: () => config.queryFn(query),
      ...options,
    })
  }
}
