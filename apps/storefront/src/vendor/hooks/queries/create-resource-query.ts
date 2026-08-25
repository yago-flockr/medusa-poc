import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

type ResourceQueryConfig<TQuery, TData> = {
  queryKey: (query: TQuery) => readonly unknown[]
  queryFn: (query: TQuery) => Promise<TData>
}

export function createResourceQueryHook<TQuery, TData>(
  config: ResourceQueryConfig<TQuery, TData>,
) {
  return function useResourceQuery(
    query: TQuery,
    options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
  ) {
    return useQuery({
      queryKey: config.queryKey(query),
      queryFn: () => config.queryFn(query),
      ...options,
    })
  }
}
